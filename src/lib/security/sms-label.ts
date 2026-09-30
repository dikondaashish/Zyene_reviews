/** Keep untrusted names from adding SMS lines, commands, or clickable URLs. */
export function smsLabel(value: string | null | undefined, fallback: string, maxLength = 64): string {
    const cleaned = (value || "")
        .normalize("NFKC")
        .replace(/\b(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/giu, " ")
        .replace(/[^\p{L}\p{N}\p{M} .,'&()-]/gu, " ")
        .replace(/\s+/gu, " ")
        .trim()
        .slice(0, maxLength)
        .trim();
    return cleaned || fallback;
}
