/** Quote PostgREST values separately from escaping SQL LIKE wildcards. */
export function reviewSearchFilter(query: string | undefined): string | null {
    const text = (query ?? "").trim().slice(0, 200).replace(/[\u0000-\u001f*]/g, " ");
    if (!text.trim()) return null;
    const pattern = `%${text.replace(/[\\%_]/g, "\\$&")}%`;
    const literal = JSON.stringify(pattern);
    return `author_name.ilike.${literal},text.ilike.${literal}`;
}
