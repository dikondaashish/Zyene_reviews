import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inboundToken, parseAddress, pickCustomerRecipients, senderAllowed } from "@/lib/enrollment/inbound-email-parse";
import { enqueueInboundContacts, excludedStaffEmails } from "@/services/enrollment/inbound-enrollment";

/**
 * Resend inbound ("email.received") webhook for invoice-copy enrollment. Svix-verified with
 * its own secret; each provider event is processed at most once; only addresses and the
 * outcome are stored (never subject, body or attachments).
 */
const eventSchema = z.object({
    type: z.literal("email.received"),
    data: z.object({
        email_id: z.string().min(1).max(200),
        from: z.string().max(400),
        to: z.array(z.string().max(400)).max(50).default([]),
        cc: z.array(z.string().max(400)).max(50).nullish(),
        bcc: z.array(z.string().max(400)).max(50).nullish(),
    }),
});

function verify(raw: string, request: Request): boolean {
    const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET?.trim();
    const id = request.headers.get("svix-id");
    const timestamp = request.headers.get("svix-timestamp");
    const signature = request.headers.get("svix-signature");
    if (!secret || !id || !timestamp || !signature) return false;
    try {
        new Webhook(secret).verify(raw, { "svix-id": id, "svix-timestamp": timestamp, "svix-signature": signature });
        return true;
    } catch {
        return false;
    }
}

async function finish(admin: SupabaseClient, eventId: string, patch: Record<string, unknown>) {
    await admin.from("inbound_email_events").update(patch).eq("provider_event_id", eventId);
    return NextResponse.json({ ok: true, ...patch });
}

export async function handleResendInbound(request: Request) {
    const raw = await request.text();
    if (!verify(raw, request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const inboundDomain = process.env.INBOUND_EMAIL_DOMAIN?.trim().toLowerCase();
    if (!inboundDomain) return NextResponse.json({ error: "Inbound enrollment is not configured" }, { status: 503 });

    let parsedJson: unknown;
    try { parsedJson = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    const parsed = eventSchema.safeParse(parsedJson);
    if (!parsed.success) return NextResponse.json({ ok: true, ignored: true });
    const { email_id: eventId, from, to, cc, bcc } = parsed.data.data;
    const recipients = [...to, ...(cc ?? []), ...(bcc ?? [])];
    const token = recipients.map((r) => parseAddress(r)?.email).filter(Boolean)
        .map((e) => inboundToken(e as string, inboundDomain)).find(Boolean) ?? null;

    const admin = createAdminClient();
    const sender = parseAddress(from);
    // Claim the event first: Resend retries and duplicate deliveries are processed once.
    const { error: claimError } = await admin.from("inbound_email_events")
        .insert({ provider_event_id: eventId, status: "received", from_address: sender?.email ?? null });
    if (claimError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    if (claimError) throw claimError;

    const { data: config } = token
        ? await admin.from("business_inbound_addresses").select("business_id, enabled, campaign_id, allowed_senders, updated_by")
            .eq("address_token", token).maybeSingle()
        : { data: null };
    if (!config) return finish(admin, eventId, { status: "rejected", reason: "Unknown enrollment address" });
    const base = { business_id: config.business_id };
    if (!config.enabled || !config.campaign_id) return finish(admin, eventId, { ...base, status: "ignored", reason: "Email enrollment is turned off" });
    if (!sender || !senderAllowed(sender.email, config.allowed_senders ?? [])) {
        return finish(admin, eventId, { ...base, status: "rejected", reason: "Sender is not on the allowed list" });
    }

    const candidates = pickCustomerRecipients(recipients, {
        inboundDomain, senderEmail: sender.email, allowedSenders: config.allowed_senders ?? [],
        excludedEmails: await excludedStaffEmails(admin, config.business_id),
    });
    if (!candidates.length) return finish(admin, eventId, { ...base, status: "ignored", reason: "No customer recipient found" });
    try {
        const enrolled = await enqueueInboundContacts(admin, {
            businessId: config.business_id, campaignId: config.campaign_id, ownerId: config.updated_by, contacts: candidates,
        });
        return finish(admin, eventId, {
            ...base, status: enrolled > 0 ? "enrolled" : "ignored", candidates: candidates.length, enrolled,
            reason: enrolled > 0 ? null : "Already enrolled or campaign unavailable",
        });
    } catch (error) {
        logger.error({ err: error, eventId }, "[resend-inbound] enrollment failed");
        // Allow Resend to retry: release the claim.
        await admin.from("inbound_email_events").delete().eq("provider_event_id", eventId);
        return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
    }
}
