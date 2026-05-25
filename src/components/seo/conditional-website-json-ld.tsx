import { headers } from "next/headers";
import { WebSiteJsonLd } from "@/components/seo/json-ld";

/** Site-wide schema only on the public marketing host — not auth, app, or review capture. */
export async function ConditionalWebSiteJsonLd() {
    const host = (await headers()).get("host")?.toLowerCase() ?? "";
    if (
        host.startsWith("auth.") ||
        host.startsWith("app.") ||
        host.includes("collectratings.com") ||
        host.includes("ratingcollect.com")
    ) {
        return null;
    }
    return <WebSiteJsonLd />;
}
