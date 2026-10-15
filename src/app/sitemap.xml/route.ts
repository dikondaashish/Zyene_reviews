import { NextResponse } from "next/server";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { SITEMAP_SECTION_IDS } from "@/lib/seo/sitemap";
import { renderSitemapIndexXml, SITEMAP_XML_HEADERS } from "@/lib/seo/sitemap-xml";

export const dynamic = "force-static";

/** Sitemap index at /sitemap.xml; sections are served by ./sitemap/[file]/route.ts. */
export function GET() {
    const xml = renderSitemapIndexXml(
        SITEMAP_SECTION_IDS.map((id) => `${MARKETING_SITE_ORIGIN}/sitemap/${id}.xml`),
    );
    return new NextResponse(xml, { headers: SITEMAP_XML_HEADERS });
}
