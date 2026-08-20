import type { SupabaseClient } from "@supabase/supabase-js";

import { upsertCustomerByIdentity } from "./customer-identity-store";

export type CustomerPatch = {
  id: string;
  businessId: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  notes?: string | null;
  is_opted_out?: boolean;
};

export async function patchCustomerRecord(supabase: SupabaseClient, patch: CustomerPatch) {
  const updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    tags?: string[];
    notes?: string | null;
    is_opted_out?: boolean;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };

  if (patch.firstName !== undefined || patch.first_name !== undefined) {
    updates.first_name = patch.firstName ?? patch.first_name;
  }
  if (patch.lastName !== undefined || patch.last_name !== undefined) {
    updates.last_name = patch.lastName ?? patch.last_name;
  }
  if (patch.email !== undefined) updates.email = patch.email;
  if (patch.phone !== undefined) updates.phone = patch.phone;
  if (patch.tags !== undefined) updates.tags = patch.tags;
  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.is_opted_out !== undefined) updates.is_opted_out = patch.is_opted_out;

  let identityResult: unknown = null;
  if (patch.email !== undefined || patch.phone !== undefined) {
    identityResult = await upsertCustomerByIdentity(supabase, {
      businessId: patch.businessId,
      customerId: patch.id,
      firstName: patch.firstName ?? patch.first_name,
      lastName: patch.lastName ?? patch.last_name,
      email: patch.email,
      phone: patch.phone,
      tags: patch.tags,
      notes: patch.notes,
    });
    delete updates.email;
    delete updates.phone;
  }

  if (identityResult && Object.keys(updates).every((key) => key === "updated_at")) {
    return identityResult;
  }

  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", patch.id)
    .eq("business_id", patch.businessId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
