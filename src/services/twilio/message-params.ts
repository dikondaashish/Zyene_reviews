export type TwilioMessageParams = {
    body: string;
    to: string;
    from?: string;
    messagingServiceSid?: string;
};

export function ensureSmsOptOutText(body: string): string {
    return /\bstop\b/i.test(body) ? body : `${body}\nReply STOP to opt out.`;
}

export function buildTwilioMessageParams(
    to: string,
    body: string,
    options: { messagingServiceSid?: string; phoneNumber?: string },
): TwilioMessageParams | null {
    if (options.messagingServiceSid) {
        return { body, messagingServiceSid: options.messagingServiceSid, to };
    }

    if (options.phoneNumber) {
        return { body, from: options.phoneNumber, to };
    }

    return null;
}
