import type { OutboundChannel } from "@/lib/review-requests/send-outbound";

export function pickWebhookString(...values: unknown[]): string | null {
    for (const v of values) {
        if (typeof v === "string") {
            const t = v.trim();
            if (t) return t;
        }
    }
    return null;
}

export function normalizeWebhookChannel(
    raw: string | null,
    hasPhone: boolean,
    hasEmail: boolean,
): OutboundChannel | null {
    const v = (raw || "").trim().toLowerCase();
    if (v === "sms" || v === "email" || v === "link" || v === "both") return v;
    if (v === "" || v === "auto") {
        if (hasPhone && hasEmail) return "both";
        if (hasPhone) return "sms";
        if (hasEmail) return "email";
        return "link";
    }
    return null;
}

export function parseGenericWebhookBody(body: Record<string, unknown>) {
    const first = pickWebhookString(body?.first_name, body?.firstName);
    const last = pickWebhookString(body?.last_name, body?.lastName);
    const fullFromParts = [first, last].filter(Boolean).join(" ").trim() || null;

    const customerName =
        pickWebhookString(body?.name, body?.customerName, body?.customer_name, body?.fullName) ||
        fullFromParts;

    const customerEmail = pickWebhookString(
        body?.email,
        body?.customerEmail,
        body?.customer_email,
        body?.emailAddress,
    );

    const customerPhone = pickWebhookString(
        body?.phone,
        body?.customerPhone,
        body?.customer_phone,
        body?.mobile,
        body?.phoneNumber,
    );

    const channelStr = pickWebhookString(body?.channel, body?.preferredChannel);
    const channel = normalizeWebhookChannel(channelStr, !!customerPhone, !!customerEmail);

    return { customerName, customerEmail, customerPhone, channel };
}
