import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IllustrativeBrandsBar } from "@/components/marketing/social-proof-illustrative-brands-bar";

describe("homepage trust strip", () => {
  const render = () => renderToStaticMarkup(createElement(IllustrativeBrandsBar));

  it("renders the neutral platform strip", () => {
    const html = render();
    expect(html).toContain("Works with Google, Facebook and Yelp");
  });

  it("does not render unverified brands that trust heading", () => {
    const html = render();
    expect(html).not.toContain("Brands that trust Zyene Reviews");
  });

  it("does not render third-party company brand logos", () => {
    const html = render();
    const thirdPartyBrands = [
      "Dunkin'",
      "Chipotle",
      "Aspen Dental",
      "Great Clips",
      "Jiffy Lube",
      "Roto-Rooter",
      "Planet Fitness",
    ];
    for (const brand of thirdPartyBrands) {
      expect(html).not.toContain(brand);
    }
  });
});
