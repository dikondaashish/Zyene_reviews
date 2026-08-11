import { describe, expect, it } from "vitest";

import { extractSample } from "../../src/services/aeo/extraction/extract-sample";
import { EXTRACTION_FIXTURES } from "../fixtures/aeo-extraction/extraction-fixtures";

/**
 * E-6: the eval harness itself.
 *
 * Runs every fixture through the REAL extraction pipeline (extractSample —
 * the same function dispatch-unit.ts calls on a real sample) and reports
 * accuracy as one number, not just pass/fail per test. A prompt or model
 * change that quietly drops accuracy from 100% to 90% is the exact silent
 * regression this harness exists to catch before it is discovered against a
 * real customer's data instead of a fixture.
 *
 * Each fixture is ALSO its own `it()` below, so a single regression names the
 * exact fixture that broke rather than only moving an aggregate percentage.
 */

type FixtureResult = { id: string; passed: boolean; failures: string[] };

function evaluate(fixture: (typeof EXTRACTION_FIXTURES)[number]): FixtureResult {
    const actual = extractSample(fixture.result, fixture.context);
    const failures: string[] = [];

    if (actual.ownBrandNamed !== fixture.expected.ownBrandNamed) {
        failures.push(
            `ownBrandNamed: expected ${fixture.expected.ownBrandNamed}, got ${actual.ownBrandNamed}`
        );
    }

    const actualMentions = actual.mentions.map((m) => ({
        label: m.label,
        kind: m.kind,
        citedOnly: m.citedOnly,
    }));
    if (JSON.stringify(actualMentions) !== JSON.stringify(fixture.expected.mentions)) {
        failures.push(
            `mentions: expected ${JSON.stringify(fixture.expected.mentions)}, got ${JSON.stringify(actualMentions)}`
        );
    }

    const actualCitations = actual.citations.map((c) => ({
        domain: c.domain,
        classification: c.classification,
        ...(c.viaRedirect ? { viaRedirect: true } : {}),
    }));
    const expectedCitations = fixture.expected.citations.map((c) => ({ ...c }));
    if (JSON.stringify(actualCitations) !== JSON.stringify(expectedCitations)) {
        failures.push(
            `citations: expected ${JSON.stringify(expectedCitations)}, got ${JSON.stringify(actualCitations)}`
        );
    }

    return { id: fixture.id, passed: failures.length === 0, failures };
}

describe("E-6 extraction eval harness — per-fixture", () => {
    for (const fixture of EXTRACTION_FIXTURES) {
        it(`${fixture.id} [${fixture.source}] — ${fixture.description.slice(0, 70)}`, () => {
            const result = evaluate(fixture);
            expect(result.failures, result.failures.join("\n")).toEqual([]);
        });
    }
});

describe("E-6 extraction eval harness — aggregate", () => {
    it("scores 100% agreement across the labeled fixture set", () => {
        const results = EXTRACTION_FIXTURES.map(evaluate);
        const failed = results.filter((r) => !r.passed);
        const accuracy = (results.length - failed.length) / results.length;

        if (failed.length > 0) {
            const report = failed
                .map((f) => `  ${f.id}:\n    ${f.failures.join("\n    ")}`)
                .join("\n");
            expect.fail(
                `${failed.length}/${results.length} fixtures failed (${(accuracy * 100).toFixed(1)}% agreement):\n${report}`
            );
        }

        expect(accuracy).toBe(1);
    });

    it("covers both real production output and constructed edge cases", () => {
        const bySource = new Map<string, number>();
        for (const f of EXTRACTION_FIXTURES) {
            bySource.set(f.source, (bySource.get(f.source) ?? 0) + 1);
        }
        expect(bySource.get("real")).toBeGreaterThan(0);
        expect(bySource.get("constructed")).toBeGreaterThan(0);
    });

    it("has no duplicate fixture ids — a copy-paste id collision would silently shadow a case", () => {
        const ids = EXTRACTION_FIXTURES.map((f) => f.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
