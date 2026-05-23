import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { loadRequestsPageStats } from "./load-requests-page-stats";

export type RequestsPageLoadResult =
    | { kind: "no-business" }
    | { kind: "error" }
    | {
          kind: "ok";
          business: { id: string; slug: string | null; name: string | null };
          page: number;
          pageSize: number;
          customerQuery: string | undefined;
          initialCustomer?: { name: string; phone: string; email: string };
          stats: {
              totalSent: number;
              delivered: number;
              clicked: number;
              reviews: number;
              emailSent: number;
              smsSent: number;
              totalFailed: number;
              deliveryRate: number;
              clickRate: number;
              conversionRate: number;
          };
          requests: Array<Record<string, unknown>>;
      };

export async function loadRequestsPageData(sp: {
    page?: string;
    customer?: string;
}): Promise<RequestsPageLoadResult> {
    const { business } = await getActiveBusinessId();

    if (!business) {
        return { kind: "no-business" };
    }

    const page = Number(sp.page) || 1;
    const pageSize = 20;

    const fetched = await loadRequestsPageStats(business.id, page, pageSize);
    if (!fetched.ok) {
        logger.error({ err: fetched.error }, "[Requests page] Fetch failed:");
        return { kind: "error" };
    }

    let initialCustomer: { name: string; phone: string; email: string } | undefined;
    const customerId = sp.customer;
    if (customerId) {
        const supabase = await createClient();
        const { data: customerData } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single();

        if (customerData) {
            initialCustomer = {
                name: `${customerData.first_name || ""} ${customerData.last_name || ""}`.trim(),
                phone: customerData.phone || "",
                email: customerData.email || "",
            };
        }
    }

    return {
        kind: "ok",
        business: { id: business.id, slug: business.slug || "", name: business.name || "" },
        page,
        pageSize,
        customerQuery: sp.customer,
        initialCustomer,
        stats: fetched.stats,
        requests: fetched.requests,
    };
}
