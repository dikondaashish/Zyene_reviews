import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { googleMapsPlaceUrl, resolveGoogleMapsListingUrl, withMapsQuery } from "@/lib/google/maps-listing-url";
import { CompetitorsTrackedMobileCard } from "@/app/(dashboard)/competitors/competitors-tracked-mobile-card";

const ID = "ChIJN1t_tDeuEmsRUsoyG83frY4";
const OLD = `https://www.google.com/maps/search/?api=1&query_place_id=${ID}`;
const params = (url: string) => new URL(url).searchParams;

describe("googleMapsPlaceUrl", () => {
    it("sends the business name with the place id, which Maps needs to open the profile", () => {
        const p = params(googleMapsPlaceUrl(ID, "Joe's KC BBQ"));
        expect(p.get("api")).toBe("1");
        expect(p.get("query")).toBe("Joe's KC BBQ");
        expect(p.get("query_place_id")).toBe(ID);
    });

    it("falls back to a place_id query when there is no name", () => {
        for (const name of [undefined, null, "  "]) expect(params(googleMapsPlaceUrl(ID, name)).get("query")).toBe(`place_id:${ID}`);
    });
});

describe("withMapsQuery", () => {
    it("repairs saved competitor links that only carry the place id", () => {
        const p = params(withMapsQuery(OLD, "Gates Bar-B-Q"));
        expect(p.get("query")).toBe("Gates Bar-B-Q");
        expect(p.get("query_place_id")).toBe(ID);
    });

    it("leaves links that already work alone", () => {
        for (const url of [
            `https://www.google.com/maps/search/?api=1&query=Gates&query_place_id=${ID}`,
            "https://maps.app.goo.gl/abc123",
            "https://www.google.com/maps/place/Gates+Bar-B-Q/@39.0,-94.5,17z",
            "not a url",
        ]) expect(withMapsQuery(url, "Gates")).toBe(url);
    });
});

describe("resolveGoogleMapsListingUrl", () => {
    it("opens the owner's own profile from a write-review link", () => {
        const url = resolveGoogleMapsListingUrl({
            googleReviewUrl: `https://search.google.com/local/writereview?placeid=${ID}`,
            businessName: "Zyene Cafe",
        });
        expect(params(url!).get("query")).toBe("Zyene Cafe");
        expect(params(url!).get("query_place_id")).toBe(ID);
    });
});

describe("competitor card", () => {
    it("links Google listing to the competitor's profile, not a blank map", () => {
        const html = renderToStaticMarkup(createElement(CompetitorsTrackedMobileCard, {
            competitor: { id: "c1", name: "Arthur Bryant's Barbeque", google_url: OLD } as never,
            syncing: false, places: undefined, sourceLabel: null, isDeleting: false, onDeleteRequest: () => {},
        } as never));
        const href = html.match(/href="([^"]*query_place_id[^"]*)"/)?.[1].replaceAll("&amp;", "&").replaceAll("&#x27;", "'") ?? "";
        expect(params(href).get("query")).toBe("Arthur Bryant's Barbeque");
    });
});
