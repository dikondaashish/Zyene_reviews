import type { SupabaseClient } from "@supabase/supabase-js";

import { upsertCustomerByIdentity } from "@/services/customers/customer-identity-store";

function splitCustomerName(customerName: string | null | undefined): {
  first: string | null;
  last: string | null;
} {
  const parts = (customerName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: null, last: null };
  if (parts.length === 1) return { first: parts[0] ?? null, last: null };
  return { first: parts[0] ?? null, last: parts.slice(1).join(" ") || null };
}

export type BumpAfterSendLegs = { phone: boolean; email: boolean };

/** Atomically merge the contact identity and count one outbound request. */
export async function bumpCustomerAfterSend(
  supabase: SupabaseClient,
  businessId: string,
  customerName: string | null | undefined,
  phone: string | null,
  email: string | null,
  legs?: BumpAfterSendLegs,
) {
  const usePhone = legs ? legs.phone : true;
  const useEmail = legs ? legs.email : true;
  if ((!usePhone || !phone) && (!useEmail || !email)) return;

  const { first, last } = splitCustomerName(customerName);
  await upsertCustomerByIdentity(supabase, {
    businessId,
    firstName: first,
    lastName: last,
    phone: usePhone ? phone : null,
    email: useEmail ? email : null,
    incrementRequests: 1,
    lastRequestSentAt: new Date().toISOString(),
  });
}
