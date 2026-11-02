import { describe, expect, it } from "vitest";
import { getMarketingNavigationTarget, isMarketingNavigationClick } from "@/lib/marketing/navigation";

const current = "https://www.zyenereviews.com/?utm_source=test";

describe("marketing navigation clicks", () => {
  const click = { defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

  it("handles a normal primary click", () => {
    expect(isMarketingNavigationClick(click)).toBe(true);
  });
  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey", "defaultPrevented"] as const)(
    "preserves native behavior for %s", key => {
      expect(isMarketingNavigationClick({ ...click, [key]: true })).toBe(false);
    },
  );
  it.each([1, 2])("leaves mouse button %s alone", button => {
    expect(isMarketingNavigationClick({ ...click, button })).toBe(false);
  });
});

describe("marketing navigation targets", () => {
  it("keeps the destination query and anchor", () => {
    expect(getMarketingNavigationTarget("/demo?source=hero#booking", current))
      .toEqual({ href: "/demo?source=hero#booking", label: "Opening the demo page…" });
  });
  it("supports ordinary marketing links", () => {
    expect(getMarketingNavigationTarget("/pricing", current)?.label).toBe("Opening page…");
  });
  it.each(["https://auth.zyenereviews.com/signup", "mailto:hello@zyene.com", "javascript:alert(1)", "tel:123"])(
    "leaves external and non-web links alone: %s", href => {
      expect(getMarketingNavigationTarget(href, current)).toBeNull();
    },
  );
  it.each(["#home-product-tour", current, "/?utm_source=test#home-product-tour"])(
    "leaves same-page navigation alone: %s", href => {
      expect(getMarketingNavigationTarget(href, current)).toBeNull();
    },
  );
  it("allows query-only navigation", () => {
    expect(getMarketingNavigationTarget("?filter=all", current)?.href).toBe("/?filter=all");
  });
});
