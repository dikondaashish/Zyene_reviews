import { describe, expect, it } from "vitest";
import { flattenDailyMetricsResponse, normalizePerformanceLocationId } from "../../src/services/google/performance";

describe("normalizePerformanceLocationId", () => {
    it("returns numeric tail from full resource names", () => {
        expect(normalizePerformanceLocationId("accounts/1/locations/987654321")).toBe("987654321");
    });

    it("strips a leading locations/ prefix", () => {
        expect(normalizePerformanceLocationId("locations/12345")).toBe("12345");
    });

    it("passes through a plain unobfuscated id", () => {
        expect(normalizePerformanceLocationId("12345")).toBe("12345");
    });

    it("returns null for empty input", () => {
        expect(normalizePerformanceLocationId("")).toBeNull();
        expect(normalizePerformanceLocationId(null)).toBeNull();
    });

    it("rejects malformed multi-segment values without a locations resource", () => {
        expect(normalizePerformanceLocationId("accounts/123")).toBeNull();
        expect(normalizePerformanceLocationId("invalid/path/value")).toBeNull();
    });
});

describe("flattenDailyMetricsResponse", () => {
    it("parses nested multiDailyMetricTimeSeries from the Performance API", () => {
        const sample = {
            multiDailyMetricTimeSeries: [
                {
                    dailyMetricTimeSeries: [
                        {
                            dailyMetric: "CALL_CLICKS",
                            timeSeries: {
                                datedValues: [
                                    { date: { year: 2026, month: 4, day: 10 }, value: "12" },
                                    { date: { year: 2026, month: 4, day: 11 }, value: "5" },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
        const flat = flattenDailyMetricsResponse(sample);
        expect(flat.length).toBe(2);
        expect(flat[0]).toMatchObject({ metricKey: "CALL_CLICKS", dateStr: "2026-04-10", value: 12 });
    });
});
