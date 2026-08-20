export type CustomerIdentity = {
  email?: string | null;
  phone?: string | null;
};

export function normalizeCustomerEmail(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

export function normalizeCustomerPhone(value: string | null | undefined): string | null {
  let digits = value?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  if (digits.length === 10) digits = `1${digits}`;
  return `+${digits}`;
}

export function customerIdentityMatches(left: CustomerIdentity, right: CustomerIdentity): boolean {
  const leftEmail = normalizeCustomerEmail(left.email);
  const rightEmail = normalizeCustomerEmail(right.email);
  if (leftEmail && rightEmail && leftEmail === rightEmail) return true;

  const leftPhone = normalizeCustomerPhone(left.phone);
  const rightPhone = normalizeCustomerPhone(right.phone);
  return Boolean(leftPhone && rightPhone && leftPhone === rightPhone);
}
