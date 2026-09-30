import { afterEach, expect, it, vi } from "vitest";
import { resolveCustomerPortalBrandColor, contrastTextForHexBackground }
    from "@/components/dashboard/customer-portal-card-colors";
import { openCustomerPortalPrintWindow }
    from "@/components/dashboard/customer-portal-card-print-html";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
afterEach(() => vi.unstubAllGlobals());

it.each([
    "</style><script>window.__syntheticAttack = true</script><style>",
    "#fff; background-image: url(https://attacker.example/collect)",
    "#ffffff} body { display: none }", "url(https://attacker.example/collect)",
    "#gggggg", "#12345", "red", "var(--untrusted)",
])("rejects stored CSS/HTML injection: %s", (input) => {
    expect(resolveCustomerPortalBrandColor(input)).toBe("rgb(34,49,34)");
});

it("preserves the API-supported hex colors and three-digit contrast", () => {
    expect(resolveCustomerPortalBrandColor(" #AbC ")).toBe("#AbC");
    expect(resolveCustomerPortalBrandColor("#123456")).toBe("#123456");
    expect(contrastTextForHexBackground("#fff")).toBe("rgb(26,26,26)");
    expect(contrastTextForHexBackground("#000")).toBe("rgb(255,255,255)");
});

it("validates colors at the HTML sink even when callers bypass color resolution", () => {
    const write = vi.fn<(html: string) => void>();
    vi.stubGlobal("window", { open: vi.fn(() => ({
        document: { write, close: vi.fn() }, focus: vi.fn(),
    })) });
    const malicious = "</style><script>window.__syntheticAttack = true</script><style>";
    openCustomerPortalPrintWindow({
        qrDataUrl: "data:image/png;base64,c3ludGhldGlj", businessSlug: "synthetic-business",
        businessName: "<script>synthetic name</script>", domain: "reviews.example",
        posterBg: malicious, posterFg: malicious,
    });
    const html = write.mock.calls[0][0];
    expect(html).not.toContain(malicious);
    expect(html).not.toContain("<script>synthetic name</script>");
    expect(html).toContain("background: rgb(34,49,34) !important");
    expect(html).toContain("color: rgb(255,255,255) !important");
});
