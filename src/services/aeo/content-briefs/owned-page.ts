/** Conservative website match for editable recommendations; never infer ownership from citations. */
export function isBusinessWebsitePage(target: string | null, website: string | null | undefined): boolean {
    if (!target || !website) return false;
    try {
        const page = new URL(target);
        const business = new URL(website.includes("://") ? website : `https://${website}`);
        const host = (url: URL) => url.hostname.toLowerCase().replace(/^www\./, "");
        return [page, business].every((url) => ["http:", "https:"].includes(url.protocol) && !url.username && !url.password)
            && host(page) === host(business);
    } catch {
        return false;
    }
}
