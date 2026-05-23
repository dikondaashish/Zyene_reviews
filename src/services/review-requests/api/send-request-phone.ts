export function normalizePhone(raw: string | null | undefined): string | null {
    let phone = (raw || "").replace(/\D/g, "");
    if (!phone) return null;
    if (phone.length === 10) phone = "+1" + phone;
    else if (!phone.startsWith("+")) phone = "+" + phone;
    return phone;
}
