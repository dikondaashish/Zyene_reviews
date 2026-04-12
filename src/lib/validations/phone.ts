/** E.164-friendly: enough digits for SMS (country code + national number). */
export function isPlausibleMobileNumber(raw: string): boolean {
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
}
