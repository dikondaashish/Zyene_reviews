/** Strip to digits only for phone comparisons. */
export function digitsOnly(s: string): string {
    return s.replace(/\D/g, "");
}

/**
 * Match customers against a free-text search (name, email, phone).
 * Phone: compare digit-only query to digit-only stored phone (substring).
 */
export function customerMatchesSearch(
    c: {
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
    },
    searchRaw: string
): boolean {
    const q = searchRaw.trim();
    if (!q) return true;

    const qLower = q.toLowerCase();
    const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.toLowerCase().trim();
    const email = (c.email ?? "").toLowerCase();
    const phone = c.phone ?? "";

    if (fullName.includes(qLower)) return true;
    if (email.includes(qLower)) return true;
    if (phone.toLowerCase().includes(qLower)) return true;

    const qDigits = digitsOnly(q);
    if (qDigits.length >= 2 && digitsOnly(phone).includes(qDigits)) return true;

    return false;
}
