import { describe, expect, it } from "vitest";
import { apiData, apiErrorMessage } from "@/lib/api/api-envelope";

describe("apiData", () => {
    it("unwraps the apiOk envelope", () => {
        expect(apiData<{ answer: string }>({ success: true, data: { answer: "hi" } })).toEqual({ answer: "hi" });
    });

    it("returns undefined for failures, legacy top-level bodies and junk", () => {
        expect(apiData({ success: false, error: "nope" })).toBeUndefined();
        expect(apiData({ answer: "top-level" })).toBeUndefined();
        expect(apiData(null)).toBeUndefined();
        expect(apiData("text")).toBeUndefined();
    });
});

describe("apiErrorMessage", () => {
    it("prefers the server's error string", () => {
        expect(apiErrorMessage({ success: false, error: "Phone is too long" }, "fallback")).toBe("Phone is too long");
    });

    it("falls back when there is no usable error (e.g. the old `message` field)", () => {
        expect(apiErrorMessage({ message: "ignored" }, "fallback")).toBe("fallback");
        expect(apiErrorMessage({ error: "  " }, "fallback")).toBe("fallback");
        expect(apiErrorMessage(null, "fallback")).toBe("fallback");
    });
});
