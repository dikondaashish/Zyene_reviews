import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    areEstimatedAeoSurfacesEnabled,
    isLiveSamplingEnabled,
} from "../../src/lib/features/aeo-surfaces";

const LIVE_KEY = "AEO_LIVE_SAMPLING";
const ESTIMATED_KEY = "AEO_SHOW_ESTIMATED_SURFACES";
const originalLive = process.env[LIVE_KEY];
const originalEstimated = process.env[ESTIMATED_KEY];

beforeEach(() => {
    delete process.env[LIVE_KEY];
    delete process.env[ESTIMATED_KEY];
});

afterEach(() => {
    if (originalLive === undefined) delete process.env[LIVE_KEY];
    else process.env[LIVE_KEY] = originalLive;
    if (originalEstimated === undefined) delete process.env[ESTIMATED_KEY];
    else process.env[ESTIMATED_KEY] = originalEstimated;
});

describe("isLiveSamplingEnabled", () => {
    it("defaults to disabled, so a fresh deployment spends nothing", () => {
        expect(isLiveSamplingEnabled()).toBe(false);
    });

    it("enables only on an explicit true", () => {
        process.env[LIVE_KEY] = "true";
        expect(isLiveSamplingEnabled()).toBe(true);
    });

    it("tolerates casing and surrounding whitespace", () => {
        process.env[LIVE_KEY] = "  TRUE  ";
        expect(isLiveSamplingEnabled()).toBe(true);
    });

    // This gate stands between a cron tick and a vendor invoice, so anything
    // that is not unambiguously "yes" has to mean no.
    it.each(["", "false", "1", "0", "yes", "on", "enabled", "TRUE!", "null", "undefined"])(
        "stays disabled for the ambiguous value %j",
        (value) => {
            process.env[LIVE_KEY] = value;
            expect(isLiveSamplingEnabled()).toBe(false);
        }
    );
});

describe("the two AEO gates are independent", () => {
    /**
     * They answer different questions. One asks whether estimated numbers may be
     * DISPLAYED; the other asks whether money may be SPENT calling engines.
     * Coupling them would mean live sampling only runs where someone opted into
     * seeing fabricated data — backwards, and it would tie a display choice to a
     * billing decision.
     */
    it("showing estimated surfaces does not enable live sampling", () => {
        process.env[ESTIMATED_KEY] = "true";
        expect(areEstimatedAeoSurfacesEnabled()).toBe(true);
        expect(isLiveSamplingEnabled()).toBe(false);
    });

    it("enabling live sampling does not resurrect the estimated surfaces", () => {
        process.env[LIVE_KEY] = "true";
        expect(isLiveSamplingEnabled()).toBe(true);
        expect(areEstimatedAeoSurfacesEnabled()).toBe(false);
    });
});
