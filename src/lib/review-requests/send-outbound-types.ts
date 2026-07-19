import type { SupabaseClient } from "@supabase/supabase-js";

export type OutboundChannel = "sms" | "email" | "link" | "both";

export type OutboundTriggerSource =
    | "manual"
    | "campaign"
    | "pos_square"
    | "pos_clover"
    | "zapier"
    | "public_link";

export interface SendOutboundReviewRequestInput {
    businessId: string;
    channel: OutboundChannel;
    customerName?: string | null;
    /** Raw phone string; normalization is applied here. */
    customerPhone?: string | null;
    customerEmail?: string | null;
    /** Defaults to "zapier" — programmatic sends look like POS/Zapier flows. */
    triggerSource?: OutboundTriggerSource;
    /** Optional pre-built admin client (handy for tests or repeated calls). */
    admin?: SupabaseClient;
}

export type SendOutboundReviewRequestResult =
    | {
          success: true;
          requestId: string;
          status: "sent";
          channel: OutboundChannel;
          reviewLink: string;
          errorMessage: string | null;
      }
    | {
          success: false;
          requestId: string | null;
          status: "failed";
          channel: OutboundChannel;
          reviewLink: string | null;
          errorMessage: string;
          /** HTTP-style code so callers can map: 400/403/404/500. */
          code: 400 | 403 | 404 | 500;
      };

export function normalizePhone(raw: string | null | undefined): string | null {
    let phone = (raw || "").replace(/\D/g, "");
    if (!phone) return null;
    if (phone.length === 10) phone = "+1" + phone;
    else if (!phone.startsWith("+")) phone = "+" + phone;
    return phone;
}

export function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function fail(
    code: 400 | 403 | 404 | 500,
    channel: OutboundChannel,
    message: string,
    requestId: string | null = null,
    reviewLink: string | null = null,
): SendOutboundReviewRequestResult {
    return {
        success: false,
        requestId,
        status: "failed",
        channel,
        reviewLink,
        errorMessage: message,
        code,
    };
}
