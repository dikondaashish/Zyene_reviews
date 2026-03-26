import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.warn("Twilio credentials missing");
}

// Only initialize Twilio if credentials are present to avoid potential build-time crashes
export const twilioClient = (accountSid && authToken) 
    ? twilio(accountSid, authToken) 
    : null as any;

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
