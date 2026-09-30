/** Share the exact URL and dimensions between copied embeds and dashboard previews. */
export function buildWidgetEmbeds(slug: string, rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com") {
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const base = `${protocol}://${rootDomain}/w/${encodeURIComponent(slug.trim())}`;
    const create = (type: "carousel" | "badge", height: number) => {
        const url = type === "badge" ? `${base}?type=badge` : base;
        const title = type === "badge" ? "Customer rating badge" : "Customer review carousel";
        return { url, height, code: `<iframe src="${url}" title="${title}" width="100%" height="${height}" loading="lazy" style="display:block; width:100%; border:0;"></iframe>` };
    };
    return { carousel: create("carousel", 440), badge: create("badge", 280) };
}
