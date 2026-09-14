import { describe, expect, it } from "vitest";

import { cronOccurrenceKey } from "../../src/lib/cron/cron-occurrence";

describe("cronOccurrenceKey", () => {
  const at = new Date("2026-09-14T13:27:45.000Z");

  it("uses a stable UTC bucket for each configured cadence", () => {
    expect(cronOccurrenceKey("five-minute", at)).toBe("2026-09-14T13:25Z");
    expect(cronOccurrenceKey("fifteen-minute", at)).toBe("2026-09-14T13:15Z");
    expect(cronOccurrenceKey("hourly", at)).toBe("2026-09-14T13Z");
    expect(cronOccurrenceKey("twelve-hour", at)).toBe("2026-09-14T12Z");
    expect(cronOccurrenceKey("daily", at)).toBe("2026-09-14");
    expect(cronOccurrenceKey("weekly", at)).toBe("2026-W38");
    expect(cronOccurrenceKey("monthly", at)).toBe("2026-09");
  });

  it("rejects invalid dates rather than collapsing all runs into one key", () => {
    expect(() => cronOccurrenceKey("daily", new Date("invalid"))).toThrow(
      "valid date",
    );
  });
});
