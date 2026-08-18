import { createHmac } from "node:crypto";

export function buildWebhookDelivery(secret: string, event: string, sourceId: string, data: unknown, createdAt = new Date().toISOString()) {
    const body = JSON.stringify({ id: `${event}:${sourceId}`, event, createdAt, data });
    return {
        body,
        headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": `${event}:${sourceId}`,
            "X-Zyene-Signature": `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`,
            "User-Agent": "Zyene-AEO-Webhooks/1.0",
        },
    };
}
