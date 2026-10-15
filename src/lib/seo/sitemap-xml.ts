import type { MetadataRoute } from "next";

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function toLastmod(value: string | Date): string {
    return value instanceof Date ? value.toISOString() : value;
}

/** Serializes sitemap entries to a `<urlset>` document, matching Next's metadata sitemap output. */
export function renderSitemapXml(entries: MetadataRoute.Sitemap): string {
    const urls = entries.map((entry) => {
        const lines = [`<loc>${escapeXml(entry.url)}</loc>`];
        if (entry.lastModified) lines.push(`<lastmod>${escapeXml(toLastmod(entry.lastModified))}</lastmod>`);
        if (entry.changeFrequency) lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
        if (entry.priority !== undefined) lines.push(`<priority>${entry.priority}</priority>`);
        return `<url>\n${lines.join("\n")}\n</url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

/** Serializes absolute sitemap URLs to a `<sitemapindex>` document. */
export function renderSitemapIndexXml(locations: string[]): string {
    const items = locations.map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`);

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join("\n")}
</sitemapindex>
`;
}

export const SITEMAP_XML_HEADERS = {
    "Content-Type": "application/xml",
    "Cache-Control": "public, max-age=0, must-revalidate",
} as const;
