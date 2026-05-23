export function formatThemeTag(tag: string): string {
    return tag
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initialsFromAuthor(author: string): string {
    const parts = author.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    const one = parts[0] || "?";
    return one.slice(0, 2).toUpperCase();
}
