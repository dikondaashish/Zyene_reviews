import { Webhook } from "svix";

export type ResendEvent = {
    type?: string;
    created_at?: string;
    data?: {
        email_id?: string;
        created_at?: string;
        [k: string]: unknown;
    };
    [k: string]: unknown;
};

export function normalizeResendEventType(t: string | undefined): string {
    return (t || "").trim().toLowerCase();
}

export function getEmailId(body: ResendEvent): string | null {
    const id = body?.data?.email_id;
    return typeof id === "string" && id.length > 0 ? id : null;
}

export function verifyResendWebhook(rawPayload: string, request: Request): boolean {
    const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (!secret) return false;

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (svixId && svixTimestamp && svixSignature) {
        try {
            const wh = new Webhook(secret);
            wh.verify(rawPayload, {
                "svix-id": svixId,
                "svix-timestamp": svixTimestamp,
                "svix-signature": svixSignature,
            });
            return true;
        } catch {
            return false;
        }
    }

    const authHeader = request.headers.get("authorization");
    return authHeader === `Bearer ${secret}`;
}
