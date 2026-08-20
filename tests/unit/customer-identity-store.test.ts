import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  mergeCustomers,
  upsertCustomerByIdentity,
} from "@/services/customers/customer-identity-store";

function clientWithRpc(data: unknown = { id: "customer-1" }) {
  const rpc = vi.fn().mockResolvedValue({ data, error: null });
  return { client: { rpc } as unknown as SupabaseClient, rpc };
}

describe("customer identity store", () => {
  it("sends email and phone together through the transactional identity RPC", async () => {
    const { client, rpc } = clientWithRpc();
    await upsertCustomerByIdentity(client, {
      businessId: "business-1",
      email: " Person@Example.com ",
      phone: "(972) 555-0199",
      incrementRequests: 1,
    });

    expect(rpc).toHaveBeenCalledWith("upsert_customer_by_identity", expect.objectContaining({
      p_business_id: "business-1",
      p_email: "person@example.com",
      p_phone: "+19725550199",
      p_increment_requests: 1,
    }));
  });

  it("uses explicit primary and duplicate IDs for manual merges", async () => {
    const { client, rpc } = clientWithRpc();
    await mergeCustomers(client, "business-1", "primary-1", "duplicate-1");
    expect(rpc).toHaveBeenCalledWith("merge_customers", {
      p_business_id: "business-1",
      p_primary_customer_id: "primary-1",
      p_duplicate_customer_id: "duplicate-1",
    });
  });
});
