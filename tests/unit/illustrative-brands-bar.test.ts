import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IllustrativeBrandsBar } from "@/components/marketing/social-proof-illustrative-brands-bar";
import { ILLUSTRATIVE_BRANDS } from "@/lib/social-proof/illustrative-brands-data";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

describe("illustrative brand carousel", () => {
  const render = () => renderToStaticMarkup(createElement(IllustrativeBrandsBar));

  it("displays the trusted brands heading", () => {
    expect(render()).toContain("Brands that trust Zyene Reviews");
  });
  it("provides an accessible pause control for the automatic slide", () => {
    expect(render()).toContain('aria-label="Pause brand carousel"');
  });
  it("hides the repeated loop from assistive technology", () => {
    expect(render()).toContain('class="home-brands-group" aria-hidden="true"');
  });
  it("renders all seven real logo URLs with readable industry labels", () => {
    const html = render();
    for (const brand of ILLUSTRATIVE_BRANDS) {
      expect(html).toContain(encodeURIComponent(getBrandLogoUrl(brand.domain)));
      expect(html).toContain(brand.industry.replaceAll("&", "&amp;"));
    }
  });
});
