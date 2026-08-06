import { createAdminClient } from "@/lib/db/supabase/admin";
import type { ReservationStore, RunStore, SampleStore } from "./ports";
import { SupabaseReservationStore } from "./supabase-reservation-store";
import { SupabaseRunStore } from "./supabase-run-store";
import { SupabaseSampleStore } from "./supabase-sample-store";

export type AeoStores = {
    reservations: ReservationStore;
    runs: RunStore;
    samples: SampleStore;
};

/**
 * Wires the Inngest functions to real storage.
 *
 * Built per call rather than cached at module load: the admin client reads
 * environment at construction, and a module-level singleton would capture it
 * during Next's build step, where the service-role key is absent.
 *
 * The Inngest functions depend on the port interfaces, not on this — which is
 * why the crash tests can drive the same dispatch path against in-memory
 * doubles and assert real state transitions rather than mocks of them.
 */
export function getAeoStores(): AeoStores {
    const db = createAdminClient();
    return {
        reservations: new SupabaseReservationStore(db),
        runs: new SupabaseRunStore(db),
        samples: new SupabaseSampleStore(db),
    };
}
