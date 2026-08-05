import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    areEstimatedAeoSurfacesEnabled,
    ESTIMATED_SURFACE_DISCLOSURE,
} from "../../src/lib/features/aeo-surfaces";

const ENV_KEY = "AEO_SHOW_ESTIMATED_SURFACES";
const originalValue = process.env[ENV_KEY];

beforeEach(() => {
    delete process.env[ENV_KEY];
});

afterEach(() => {
    if (originalValue === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = originalValue;
});

describe("areEstimatedAeoSurfacesEnabled", () => {
    it("defaults to disabled when the variable is unset", () => {
        expect(areEstimatedAeoSurfacesEnabled()).toBe(false);
    });

    it("enables only on an explicit true", () => {
        process.env[ENV_KEY] = "true";
        expect(areEstimatedAeoSurfacesEnabled()).toBe(true);
    });

    it("tolerates casing and surrounding whitespace", () => {
        process.env[ENV_KEY] = "  TRUE  ";
        expect(areEstimatedAeoSurfacesEnabled()).toBe(true);
    });

    // The heuristic surfaces move with a customer's review rating, so anything
    // other than a deliberate opt-in must keep them off.
    it.each(["", "false", "1", "yes", "on", "TRUE!", "undefined"])(
        "stays disabled for the ambiguous value %j",
        (value) => {
            process.env[ENV_KEY] = value;
            expect(areEstimatedAeoSurfacesEnabled()).toBe(false);
        }
    );
});

describe("ESTIMATED_SURFACE_DISCLOSURE", () => {
    it("states the method rather than only labelling the feature beta", () => {
        expect(ESTIMATED_SURFACE_DISCLOSURE).toMatch(/review rating/i);
        expect(ESTIMATED_SURFACE_DISCLOSURE).toMatch(/no AI engine or search provider was queried/i);
        expect(ESTIMATED_SURFACE_DISCLOSURE).not.toMatch(/\bbeta\b/i);
    });
});
