/**
 * The visitor's journey across pages and visits, so intent and personalization use the whole
 * session rather than one page. Pure reducers plus try/catch-wrapped storage.
 */

const VISIT_KEY = "zyene-lead-wizard-visits";
const SESSION_KEY = "zyene-lead-wizard-journey";
const MAX_PAGES = 25;

export type SessionJourney = { pages: string[]; engagedMs: number };
export type VisitHistory = { visits: number; lastVisitAt: number | null };

export function recordPage(journey: SessionJourney, pathname: string): SessionJourney {
    if (journey.pages[journey.pages.length - 1] === pathname) return journey;
    return { ...journey, pages: [...journey.pages, pathname].slice(-MAX_PAGES) };
}

/** A new session bumps the visit count; scoring uses the count *before* this visit. */
export function startVisit(history: VisitHistory, now: number): VisitHistory {
    return { visits: history.visits + 1, lastVisitAt: now };
}

function parse<T>(raw: string | null, fallback: T, check: (value: Record<string, unknown>) => T | null): T {
    if (!raw) return fallback;
    try {
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== "object") return fallback;
        return check(value as Record<string, unknown>) ?? fallback;
    } catch {
        return fallback;
    }
}

export function parseSessionJourney(raw: string | null): SessionJourney {
    return parse(raw, { pages: [], engagedMs: 0 }, (v) =>
        Array.isArray(v.pages) && typeof v.engagedMs === "number"
            ? { pages: v.pages.filter((p): p is string => typeof p === "string").slice(-MAX_PAGES), engagedMs: v.engagedMs }
            : null,
    );
}

export function parseVisitHistory(raw: string | null): VisitHistory {
    return parse(raw, { visits: 0, lastVisitAt: null }, (v) =>
        typeof v.visits === "number"
            ? { visits: v.visits, lastVisitAt: typeof v.lastVisitAt === "number" ? v.lastVisitAt : null }
            : null,
    );
}

function read(storage: () => Storage, key: string): string | null {
    try {
        return storage().getItem(key);
    } catch {
        return null;
    }
}

function write(storage: () => Storage, key: string, value: unknown) {
    try {
        storage().setItem(key, JSON.stringify(value));
    } catch {
        // Scoring falls back to the current page alone without storage.
    }
}

const session = () => window.sessionStorage;
const local = () => window.localStorage;

/** Records this page view; returns the journey and how many visits came before this one. */
export function trackPageView(pathname: string, now = Date.now()): { journey: SessionJourney; previousVisits: number } {
    const rawJourney = read(session, SESSION_KEY);
    let history = parseVisitHistory(read(local, VISIT_KEY));
    if (rawJourney === null) {
        history = startVisit(history, now);
        write(local, VISIT_KEY, history);
    }
    const journey = recordPage(parseSessionJourney(rawJourney), pathname);
    write(session, SESSION_KEY, journey);
    return { journey, previousVisits: Math.max(0, history.visits - 1) };
}

export function readSessionJourney(): SessionJourney {
    return parseSessionJourney(read(session, SESSION_KEY));
}

export function addSessionEngagement(ms: number) {
    const journey = readSessionJourney();
    write(session, SESSION_KEY, { ...journey, engagedMs: journey.engagedMs + Math.max(0, ms) });
}
