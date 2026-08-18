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
 * E-9.1. One event per yearly-plan org whose monthly credit-refresh day is
 * today (yearly-credit-reset-eligibility.ts decides "today"). grantedMicroUsd
 * is resolved once, at fan-out time, by the cron route — the worker trusts it
 * rather than re-deriving it, the same way aeo/dispatch.requested carries a
 * fully-resolved DispatchRequest rather than making the child re-plan.
 */
export type AeoCreditResetRequestedEvent = {
    data: {
        organizationId: string;
        grantedMicroUsd: number;
    };
};

/**
 * E-3 automation. One event per business whose weekly crawl slot
 * (crawl-slot.ts) is now. Carries a fully-resolved origin and plan-derived
 * page cap, the same "fan-out resolves, worker trusts" split as
 * AeoDispatchRequestedEvent — the worker never has to re-derive eligibility.
 */
export type AeoCrawlRequestedEvent = {
    data: {
        businessId: string;
        organizationId: string;
        origin: string;
        /** Null for a real org with no plan set (e.g. mid-signup) — pageCapForPlan() treats that the same as an unrecognized plan: the safer Starter cap. */
        planId: string | null;
        trigger: "scheduled" | "manual";
    };
};

/**
 * F8: one event per business to check for new alerts. Detection itself is
 * pure reads (no vendor calls, no crawling), so unlike E-3/E-7 this needs no
 * per-business slot — every AEO-eligible business is checked on the same
 * daily fan-out.
 */
export type AeoAlertCheckRequestedEvent = {
    data: {
        businessId: string;
        organizationId: string;
    };
};

export type AeoPageDiagnosticRequestedEvent = {
    data: {
        pageId: string;
        url: string;
        businessId: string;
        organizationId: string;
    };
};

export type AeoReportRequestedEvent = {
    data: { scheduleId: string };
};

export type AeoPhase3RefreshRequestedEvent = {
    data: { businessId: string; organizationId: string; trigger: "run_completed" | "manual" };
};

/**
 * PRD-5 geo-grid. One event per grid run; the worker fans out internally
 * because a grid is size^2 BILLED requests and the concurrency limit has to
 * apply across the whole grid, not per cell.
 */
export type AeoGeoGridRequestedEvent = {
    data: {
        runId: string;
        businessId: string;
        organizationId: string;
        keyword: string;
        gridSize: 5 | 7 | 9;
        spacingMeters: number;
        centerLat: number;
        centerLng: number;
        placeId: string;
        estimatedCostMicroUsd: number;
        languageCode?: string;
    };
};
