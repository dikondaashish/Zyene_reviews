/**
 * Event payloads for the AEO sampling and geo-grid workers.
 *
 * Split from client.ts so the AEO surface's contract sits next to the workers
 * that consume it, rather than growing the shared client every time an engine
 * or surface is added.
 */

/**
 * E-7 sampling. The parent plans and fans out; one child runs each unit.
 *
 * Per-unit children rather than one function looping every prompt x engine:
 * retry isolation is then per dispatch, and the granularity matches the
 * idempotency key exactly, so one poisoned engine cannot force a whole run to
 * be re-attempted — which for a paid engine would mean re-paying for the units
 * that already succeeded.
 */
export type AeoRunRequestedEvent = {
    data: {
        businessId: string;
        organizationId: string;
        trigger: "scheduled" | "manual" | "backfill";
        /** The E-10 slot this run came from, for smoothing audits. */
        scheduledFor?: string;
        engineIds?: string[];
        attemptsPerPrompt?: number;
        /** Recorded before the first billable call, never inferred after. */
        overageAuthorised?: boolean;
    };
};

export type AeoDispatchRequestedEvent = {
    data: {
        runId: string;
        businessId: string;
        organizationId: string;
        promptId: string;
        promptText: string;
        engineId: string;
        attempt: number;
        locale: { country: string; language: string; city?: string };
        usageDate: string;
        overageAuthorised: boolean;
        requestedUnits: number;
    };
};

/**
 * PRD-5 geo-grid. One event per grid run; the worker fans out internally
 * because a grid is size^2 BILLED requests and the concurrency limit has to
 * apply across the whole grid, not per cell.
 */
export type AeoGeoGridRequestedEvent = {
    data: {
        businessId: string;
        keyword: string;
        gridSize: 5 | 7 | 9;
        spacingMeters: number;
        centerLat: number;
        centerLng: number;
        languageCode?: string;
    };
};

