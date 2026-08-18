export type Nap = { name: string; address: string; phone: string };

function normalizeWords(value: string): string {
    return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function compareNapObservation(canonical: Nap, observed: Nap) {
    const nameMatches = normalizeWords(canonical.name) === normalizeWords(observed.name);
    const addressMatches = normalizeWords(canonical.address) === normalizeWords(observed.address);
    const phoneMatches = normalizePhone(canonical.phone) === normalizePhone(observed.phone);
    return { nameMatches, addressMatches, phoneMatches, consistent: nameMatches && addressMatches && phoneMatches };
}
