"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhase2Context } from "./action-context";
import { encryptAlertSecret } from "@/services/aeo/alerting/channel-secrets";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";

const channelSchema = z.object({ name: z.string().trim().min(2).max(80), type: z.enum(["slack", "webhook"]), endpoint: z.url(), signingSecret: z.string().max(200).optional() });

export async function createAlertChannel(formData: FormData) {
    const { admin, businessId, organizationId } = await requirePhase2Context();
    const parsed = channelSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid alert channel");
    const url = new URL(parsed.data.endpoint);
    if (url.protocol !== "https:" || (parsed.data.type === "slack" && url.hostname !== "hooks.slack.com")) throw new Error("Use a valid HTTPS endpoint");
    const safety = await checkOriginIsPublic(url.href); if (!safety.safe) throw new Error(safety.reason);
    const result = await admin.from("aeo_alert_channels" as never).insert({
        organization_id: organizationId, business_id: businessId, name: parsed.data.name, channel_type: parsed.data.type,
        endpoint_ciphertext: encryptAlertSecret(url.href),
        signing_secret_ciphertext: parsed.data.signingSecret ? encryptAlertSecret(parsed.data.signingSecret) : null,
    } as never);
    if (result.error) throw new Error("Unable to save alert channel");
    revalidatePath("/google-seo-aeo/phase-2");
}
