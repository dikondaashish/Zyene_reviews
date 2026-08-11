import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import type { BillingGateway } from "../orchestration/ports";
import { billTest } from "./bill-test";
import { SupabaseCreditLedgerStore } from "./supabase-credit-ledger-store";
import { StripeOverageChargeGateway } from "./stripe-overage-charge-gateway";

type Admin = SupabaseClient<Database>;

/**
 * Everything billTest needs (credit ledger, Stripe gateway, and resolving
 * which Stripe customer an org even is) assembled behind the one call
 * dispatch-unit.ts makes — see BillingGateway in orchestration/ports.ts for
 * why that file only needs the interface, not this.
 */
export class SupabaseBillingGateway implements BillingGateway {
    private readonly ledger: SupabaseCreditLedgerStore;
    private readonly charges: StripeOverageChargeGateway;

    constructor(private readonly db: Admin) {
        this.ledger = new SupabaseCreditLedgerStore(db);
        this.charges = new StripeOverageChargeGateway();
    }

    async settleTest(input: { organizationId: string; sampleId: string }): Promise<void> {
        // Repeated here, not just inside billTest: this class also does an
        // organization lookup billTest knows nothing about, and that lookup is
        // I/O too. The flag must gate every query this gateway can make, not
        // only the ones billTest happens to own.
        if (!isMeteredBillingLive()) return;

        const { data } = await this.db
            .from("organizations")
            .select("stripe_customer_id")
            .eq("id", input.organizationId)
            .single();

        await billTest(
            {
                organizationId: input.organizationId,
                sampleId: input.sampleId,
                stripeCustomerId: data?.stripe_customer_id ?? null,
            },
            { ledger: this.ledger, charges: this.charges }
        );
    }
}
