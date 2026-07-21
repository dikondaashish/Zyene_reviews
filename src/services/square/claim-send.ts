import type { createAdminClient } from "@/lib/db/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

const CLAIMABLE = ["received", "skipped_no_contact", "resolved"] as const;

/**
 * Atomically claim a payment row for outbound send.
 * Only one of payment.created / payment.updated wins the race.
 */
export async function claimSquarePaymentSend(
    admin: Admin,
    merchantId: string,
    paymentId: string,
): Promise<boolean> {
    const { data } = await admin
        .from("square_payment_events")
        .update({ status: "sending" })
        .eq("merchant_id", merchantId)
        .eq("payment_id", paymentId)
        .is("review_request_id", null)
        .in("status", [...CLAIMABLE])
        .select("id")
        .maybeSingle();
    return Boolean(data);
}
