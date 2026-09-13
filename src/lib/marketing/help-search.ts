export interface HelpSearchItem {
    title: string;
    excerpt: string;
    category: string;
    path: string;
}

export function getHelpSearchResults(items: HelpSearchItem[], query: string, limit = 6): HelpSearchItem[] {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];

    const searchTerms = normalized.split(/\s+/);

    return items
        .filter((item) => {
            const searchableText = `${item.title} ${item.excerpt} ${item.category}`.toLocaleLowerCase();
            return searchTerms.every((term) => searchableText.includes(term));
        })
        .slice(0, limit);
}
