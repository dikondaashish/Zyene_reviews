import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

/**
 * Lazily initializes the Twilio client on first use.
 * Throws if credentials are missing when actually needed (not at import time).
 */
export function getTwilioClient(): ReturnType<typeof twilio> {
    if (!_client) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!accountSid || !authToken) {
            throw new Error(
                "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN. " +
                    "Check your .env.local file or deployment environment."
            );
        }
        _client = twilio(accountSid, authToken);
    }
    return _client;
}

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
