import { describe, expect, it } from "vitest";
import { ApiRouteError, toApiError } from "../../src/app/api/_shared/errors";

describe("api shared errors", () => {
  it("normalizes ApiRouteError with status/code/details", () => {
    const err = new ApiRouteError("Forbidden", {
      status: 403,
      code: "FORBIDDEN",
      details: "membership missing",
    });
    const normalized = toApiError(err);
    expect(normalized).toEqual({
      message: "Forbidden",
      status: 403,
      code: "FORBIDDEN",
      details: "membership missing",
    });
  });

  it("normalizes generic errors to 500", () => {
    const normalized = toApiError(new Error("boom"));
    expect(normalized.status).toBe(500);
    expect(normalized.message).toBe("boom");
  });
});

