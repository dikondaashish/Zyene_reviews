import type { createAdminClient } from "@/lib/db/supabase/admin";
import { fetchSquareCustomer } from "@/services/square/api-client";
import {
    extractSquareCustomerId,
    resolveContactFromSquareCustomer,
    type SquareResolvedContact,
} from "@/services/square/resolve-contact";
import type { ParsedSquarePaymentEvent } from "@/services/square/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;

export type SquareExistingEvent = {
    id: string;
    status: string;
    customer_email: string | null;
    customer_phone: string | null;
    review_request_id: string | null;
};

export async function findSquarePaymentEvent(
    admin: Admin,
    merchantId: string,
    paymentId: string,
): Promise<SquareExistingEvent | null> {
    const { data } = await admin
        .from("square_payment_events")
        .select("id, status, customer_email, customer_phone, review_request_id")
        .eq("merchant_id", merchantId)
        .eq("payment_id", paymentId)
        .maybeSingle();
    return data ?? null;
}

export async function patchSquarePaymentEvent(
    admin: Admin,
    event: ParsedSquarePaymentEvent,
    patch: Record<string, unknown>,
): Promise<void> {
    await admin
        .from("square_payment_events")
        .update(patch)
        .eq("merchant_id", event.merchantId)
        .eq("payment_id", event.paymentId);
}

export async function insertSquarePaymentEvent(
    admin: Admin,
    args: { businessId: string; merchantId: string; paymentId: string; eventType: string },
): Promise<boolean> {
    const { error } = await admin.from("square_payment_events").insert({
        business_id: args.businessId,
        merchant_id: args.merchantId,
        payment_id: args.paymentId,
        event_type: args.eventType,
        status: "received",
    });
    if (error) {
        if (error.code === "23505") return false;
        throw error;
    }
    return true;
}

export async function resolveSquareContactViaCustomerId(args: {
    payment: unknown;
    accessToken: string;
}): Promise<SquareResolvedContact> {
    const empty: SquareResolvedContact = { email: null, phone: null, name: null };
    const customerId = extractSquareCustomerId(args.payment);
    if (!customerId) return empty;
    const customer = await fetchSquareCustomer({
        customerId,
        accessToken: args.accessToken,
    });
    if (!customer) return empty;
    return resolveContactFromSquareCustomer(customer);
}
