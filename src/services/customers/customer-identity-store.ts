import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeCustomerEmail,
  normalizeCustomerPhone,
} from "@/lib/customers/identity";

export type CustomerIdentityWrite = {
  businessId: string;
  customerId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  incrementRequests?: number;
  lastRequestSentAt?: string | null;
};

type RpcResult = { data: unknown; error: { message?: string } | null };

async function callRpc(
  supabase: SupabaseClient,
  name: string,
  args: Record<string, unknown>,
): Promise<RpcResult> {
  return supabase.rpc(name as never, args as never) as unknown as Promise<RpcResult>;
}

export async function upsertCustomerByIdentity(
  supabase: SupabaseClient,
  input: CustomerIdentityWrite,
) {
  const result = await callRpc(supabase, "upsert_customer_by_identity", {
    p_business_id: input.businessId,
    p_customer_id: input.customerId ?? null,
    p_first_name: input.firstName?.trim() || null,
    p_last_name: input.lastName?.trim() || null,
    p_email: normalizeCustomerEmail(input.email),
    p_phone: normalizeCustomerPhone(input.phone),
    p_tags: input.tags ?? null,
    p_notes: input.notes?.trim() || null,
    p_increment_requests: input.incrementRequests ?? 0,
    p_last_request_sent_at: input.lastRequestSentAt ?? null,
  });

  if (result.error) throw new Error(result.error.message || "Failed to save customer");
  return result.data;
}

export async function mergeCustomers(
  supabase: SupabaseClient,
  businessId: string,
  primaryCustomerId: string,
  duplicateCustomerId: string,
) {
  const result = await callRpc(supabase, "merge_customers", {
    p_business_id: businessId,
    p_primary_customer_id: primaryCustomerId,
    p_duplicate_customer_id: duplicateCustomerId,
  });
  if (result.error) throw new Error(result.error.message || "Failed to merge customers");
  return result.data;
}

export async function importCustomersByIdentity(
  supabase: SupabaseClient,
  businessId: string,
  customers: Array<Record<string, string | null>>,
): Promise<number> {
  const result = await callRpc(supabase, "import_customers_by_identity", {
    p_business_id: businessId,
    p_customers: customers,
  });
  if (result.error) throw new Error(result.error.message || "Failed to import customers");
  return typeof result.data === "number" ? result.data : 0;
}
