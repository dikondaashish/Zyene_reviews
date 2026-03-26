import { Resend } from 'resend';

// Only initialize Resend if the API key is present
// This prevents errors during Next.js build time when environment variables are missing
export const resend = process.env.RESEND_API_KEY 
    ? new Resend(process.env.RESEND_API_KEY) 
    : null as unknown as Resend;
