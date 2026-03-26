import { describe, expect, it } from "vitest";
import { apiError, apiOk } from "../../src/app/api/_shared/responses";

describe("api responses", () => {
  it("returns wrapped success payload", async () => {
    const res = apiOk({ total: 5 });
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: { total: 5 },
    });
  });

  it("returns normalized error payload with metadata", async () => {
    const res = apiError("Bad Request", {
      status: 400,
      code: "INVALID_PAYLOAD",
      details: "missing ids",
    });
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: "Bad Request",
      details: "missing ids",
      code: "INVALID_PAYLOAD",
    });
  });
});

