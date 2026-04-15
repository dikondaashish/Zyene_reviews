import { describe, expect, it } from "vitest";
import { parseMarketPositioningBriefPayload } from "../../src/lib/competitors/market-positioning-brief-result";

describe("market-positioning-brief-result", () => {
  it("parseMarketPositioningBriefPayload maps fields", () => {
    const r = parseMarketPositioningBriefPayload({
      headline: "Test",
      overview: "Overview text.",
      positioning_bullets: ["a", "b"],
      opportunity_actions: [{ title: "Do X", detail: "Because Y" }],
      data_limitations: "Limited to public data.",
    });
    expect(r.headline).toBe("Test");
    expect(r.positioningBullets).toEqual(["a", "b"]);
    expect(r.opportunityActions).toHaveLength(1);
    expect(r.dataLimitations).toBe("Limited to public data.");
  });

  it("parseMarketPositioningBriefPayload adds default limitations when empty", () => {
    const r = parseMarketPositioningBriefPayload({
      headline: "H",
      overview: "O",
      positioning_bullets: [],
      opportunity_actions: [],
      data_limitations: "",
    });
    expect(r.dataLimitations.length).toBeGreaterThan(20);
  });
});
