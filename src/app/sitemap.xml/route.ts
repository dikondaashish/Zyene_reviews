import { NextResponse } from "next/server";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

export const dynamic = "force-static";

export function GET() {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${MARKETING_SITE_ORIGIN}/sitemap/core.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${MARKETING_SITE_ORIGIN}/sitemap/support.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${MARKETING_SITE_ORIGIN}/sitemap/es.xml</loc>
  </sitemap>
</sitemapindex>
`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=0, must-revalidate",
        },
    });
}
