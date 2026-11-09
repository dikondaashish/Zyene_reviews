import { describe, expect, it } from "vitest";
import {
    CLOVER_CONNECT_PATH,
    classifyCloverCallback,
    cloverLoginRedirectPath,
} from "@/services/clover/launch";

const qs = (s: string) => new URLSearchParams(s);

describe("classifyCloverCallback", () => {
    it("treats code + state as our own OAuth round trip", () => {
        expect(classifyCloverCallback(qs("code=abc&state=xyz&merchant_id=M1"))).toBe("oauth");
    });

    it("treats a state-less code from Clover as an App Market launch", () => {
        expect(classifyCloverCallback(qs("merchant_id=M1&client_id=APP&code=abc"))).toBe(
            "app_market_launch",
        );
        expect(classifyCloverCallback(qs("merchant_id=M1"))).toBe("app_market_launch");
    });

    it("reports provider errors before anything else", () => {
        expect(classifyCloverCallback(qs("error=access_denied&code=abc"))).toBe("error");
    });

    it("flags state without code as missing params", () => {
        expect(classifyCloverCallback(qs("state=xyz"))).toBe("missing_params");
        expect(classifyCloverCallback(qs(""))).toBe("missing_params");
    });
});

describe("cloverLoginRedirectPath", () => {
    it("returns to the connect route after login", () => {
        expect(cloverLoginRedirectPath(null)).toBe(
            `/login?next=${encodeURIComponent(CLOVER_CONNECT_PATH)}`,
        );
    });

    it("keeps the business id through login", () => {
        const path = cloverLoginRedirectPath("b-1");
        const next = new URLSearchParams(path.split("?")[1]).get("next");
        expect(next).toBe(`${CLOVER_CONNECT_PATH}?businessId=b-1`);
    });
});
