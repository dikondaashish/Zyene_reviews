import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import type { BillingGateway } from "../orchestration/ports";
import { billTest } from "./bill-test";
import { SupabaseCreditLedgerStore } from "./supabase-credit-ledger-store";

type Admin = SupabaseClient<Database>;

/**
 * Everything billTest needs, assembled behind the one call dispatch-unit.ts
 * makes - see BillingGateway in orchestration/ports.ts for why that file only
 * needs the interface, not this.
 */
export class SupabaseBillingGateway implements BillingGateway {
    private readonly ledger: SupabaseCreditLedgerStore;

    constructor(db: Admin) {
        this.ledger = new SupabaseCreditLedgerStore(db);
    }

    async settleTest(input: { organizationId: string; sampleId: string }): Promise<void> {
        if (!isMeteredBillingLive()) return;
        await billTest(input, { ledger: this.ledger });
    }
}
