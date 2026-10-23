/**
 * First name for `{first_name}` in review-request messages. People write
 * "Hi Ashish", not "Hi Ashish Dikonda". Only a plain name counts: anything
 * with digits, symbols or an @ returns "" so the caller can fall back.
 */
export function customerFirstName(customerName: string | null | undefined): string {
    const first = (customerName || "").trim().split(/\s+/)[0] || "";
    if (!first || first.length > 30 || first.toLowerCase() === "there" || first.toLowerCase() === "customer") return "";
    if (!/^[\p{L}][\p{L}'’-]*$/u.test(first)) return "";
    return first.charAt(0).toLocaleUpperCase() + first.slice(1);
}

/** Subjects such as "{first_name}, how was dinner?" read badly with a stand-in, so the name and its comma drop out. */
export function fillSubjectFirstName(subject: string, customerName: string | null | undefined): string {
    if (!subject.includes("{first_name}")) return subject;
    const first = customerFirstName(customerName);
    if (first) return subject.replace(/\{first_name\}/g, first);
    const dropped = subject.replace(/\{first_name\},?\s*/g, "").trim();
    return dropped.charAt(0).toLocaleUpperCase() + dropped.slice(1);
}
