import { Resend } from "resend";

/**
 * Second Resend account — CollectRatings capture-domain mail only.
 * Primary Zyene mail keeps using `RESEND_API_KEY` / `client.ts`.
 */
export const resendCollectratings = process.env.RESEND_COLLECTRATINGS_API_KEY
    ? new Resend(process.env.RESEND_COLLECTRATINGS_API_KEY)
    : null;
