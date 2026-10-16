import { NextResponse } from "next/server";
import { SITEMAP_SECTION_IDS, SITEMAP_SECTIONS, type SitemapSection } from "@/lib/seo/sitemap";
import { renderSitemapXml, SITEMAP_XML_HEADERS } from "@/lib/seo/sitemap-xml";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
    return SITEMAP_SECTION_IDS.map((id) => ({ file: `${id}.xml` }));
}

function isSection(value: string): value is SitemapSection {
    return (SITEMAP_SECTION_IDS as string[]).includes(value);
}

/** Per-section sitemaps: /sitemap/core.xml, /sitemap/support.xml. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
    const { file } = await params;
    const id = file.replace(/\.xml$/, "");

    if (!file.endsWith(".xml") || !isSection(id)) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(renderSitemapXml(SITEMAP_SECTIONS[id]()), { headers: SITEMAP_XML_HEADERS });
}
