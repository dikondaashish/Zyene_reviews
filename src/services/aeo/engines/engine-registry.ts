import type { AnswerEngineAdapter, AnswerEngineId } from "./engine-types";
import { getEngineDescriptor, isMeterable, listEngineDescriptors } from "./engine-catalog";
import type { AnswerEngineDescriptor } from "./engine-catalog";

/**
 * E-1 registry. Engines are looked up here rather than imported directly so that
 * swapping a vendor — or standing an engine down mid-incident — is a registration
 * change, not a code change across the orchestrator.
 */

export type EngineAvailabilityState =
    /** Registered, configured, priced. Safe to run. */
    | "available"
    /** No adapter registered yet (typically a later-phase engine). */
    | "not_implemented"
    /** Adapter exists but credentials or config are missing. */
    | "not_configured"
    /** Adapter is ready but we cannot state its cost, so it must not bill. */
    | "pricing_unconfirmed";

export type EngineAvailability = {
    descriptor: AnswerEngineDescriptor;
    state: EngineAvailabilityState;
    /** Human-readable explanation, surfaced directly in the coverage panel (F1.10). */
    reason: string;
};

export class EngineRegistry {
    private readonly adapters = new Map<AnswerEngineId, AnswerEngineAdapter>();

    register(adapter: AnswerEngineAdapter): void {
        this.adapters.set(adapter.id, adapter);
    }

    unregister(id: AnswerEngineId): void {
        this.adapters.delete(id);
    }

    get(id: AnswerEngineId): AnswerEngineAdapter | null {
        return this.adapters.get(id) ?? null;
    }

    /** Availability for every catalogued engine, implemented or not. */
    describeAll(): EngineAvailability[] {
        return listEngineDescriptors().map((descriptor) => this.describe(descriptor.id));
    }

    describe(id: AnswerEngineId): EngineAvailability {
        const descriptor = getEngineDescriptor(id);
        const adapter = this.adapters.get(id);

        if (!adapter) {
            return {
                descriptor,
                state: "not_implemented",
                reason: `Not implemented yet — planned for Phase ${descriptor.phase}.`,
            };
        }
        if (!adapter.isConfigured()) {
            return {
                descriptor,
                state: "not_configured",
                reason: `${descriptor.vendor} credentials are not configured.`,
            };
        }
        if (!isMeterable(id)) {
            return {
                descriptor,
                state: "pricing_unconfirmed",
                reason: `${descriptor.vendor} pricing is unconfirmed, so this engine cannot be billed.`,
            };
        }
        return { descriptor, state: "available", reason: "Ready to sample." };
    }

    /**
     * The adapters a paid run may actually use.
     *
     * Deliberately stricter than "is an adapter present": an engine whose cost we
     * cannot state is withheld even when it is fully wired, so an unquoted vendor
     * can never start charging customers by accident.
     */
    resolveRunnable(requested: readonly AnswerEngineId[]): {
        runnable: AnswerEngineAdapter[];
        withheld: EngineAvailability[];
    } {
        const runnable: AnswerEngineAdapter[] = [];
        const withheld: EngineAvailability[] = [];

        for (const id of dedupe(requested)) {
            const availability = this.describe(id);
            const adapter = this.adapters.get(id);
            if (availability.state === "available" && adapter) {
                runnable.push(adapter);
            } else {
                withheld.push(availability);
            }
        }

        return { runnable, withheld };
    }
}

function dedupe(ids: readonly AnswerEngineId[]): AnswerEngineId[] {
    return [...new Set(ids)];
}

/** Process-wide registry. Adapters self-register at module load. */
export const engineRegistry = new EngineRegistry();
