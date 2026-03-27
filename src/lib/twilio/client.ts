import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.warn("Twilio credentials missing");
}

export const twilioClient = twilio(accountSid, authToken);
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
