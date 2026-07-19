export type CloverResolvedContact = {
    email: string | null;
    phone: string | null;
    name: string | null;
};

type CloverCustomer = {
    firstName?: string;
    lastName?: string;
    emailAddresses?: unknown;
    phoneNumbers?: unknown;
};

/**
 * Pull email/phone/name from Clover payment/order/customer JSON shapes.
 * Tolerant of expand variants used by `/payments/{id}?expand=...`.
 * Clover often nests emails/phones as `{ elements: [...] }` (not a bare array).
 */
export function resolveContactFromCloverPayment(payment: unknown): CloverResolvedContact {
    const root = asRecord(payment);
    const customers: CloverCustomer[] = [];

    pushCustomers(customers, root?.customer);
    pushCustomers(customers, root?.customers);

    const order = asRecord(root?.order);
    pushCustomers(customers, order?.customer);
    pushCustomers(customers, order?.customers);

    let email: string | null = null;
    let phone: string | null = null;
    let name: string | null = null;

    for (const c of customers) {
        if (!email) {
            for (const item of listFromElementsOrArray(c.emailAddresses)) {
                const e =
                    typeof item.emailAddress === "string" ? item.emailAddress.trim() : "";
                if (e) {
                    email = e;
                    break;
                }
            }
        }
        if (!phone) {
            for (const item of listFromElementsOrArray(c.phoneNumbers)) {
                const p =
                    typeof item.phoneNumber === "string" ? item.phoneNumber.trim() : "";
                if (p) {
                    phone = p;
                    break;
                }
            }
        }
        if (!name) {
            const n = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
            if (n) name = n;
        }
    }

    return { email, phone, name };
}

/** Customer IDs present on payment/order when expand only returns stubs. */
export function extractCloverCustomerIds(payment: unknown): string[] {
    const ids = new Set<string>();
    const root = asRecord(payment);
    collectCustomerIds(ids, root?.customer);
    collectCustomerIds(ids, root?.customers);
    const order = asRecord(root?.order);
    collectCustomerIds(ids, order?.customer);
    collectCustomerIds(ids, order?.customers);
    return [...ids];
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

/** Clover list fields are either `T[]` or `{ elements: T[] }`. */
function listFromElementsOrArray(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value)) {
        return value.flatMap((item) => {
            const rec = asRecord(item);
            return rec ? [rec] : [];
        });
    }
    const elements = asRecord(value)?.elements;
    if (Array.isArray(elements)) return listFromElementsOrArray(elements);
    return [];
}

function pushCustomers(target: CloverCustomer[], value: unknown): void {
    if (!value) return;
    if (Array.isArray(value)) {
        for (const item of value) {
            const rec = asRecord(item);
            if (rec) target.push(rec as CloverCustomer);
        }
        return;
    }
    const elements = asRecord(value)?.elements;
    if (Array.isArray(elements)) {
        pushCustomers(target, elements);
        return;
    }
    const rec = asRecord(value);
    if (rec) target.push(rec as CloverCustomer);
}

function collectCustomerIds(ids: Set<string>, value: unknown): void {
    if (!value) return;
    if (Array.isArray(value)) {
        for (const item of value) collectCustomerIds(ids, item);
        return;
    }
    const rec = asRecord(value);
    if (!rec) return;
    if (typeof rec.id === "string" && rec.id.length > 0) ids.add(rec.id);
    if (Array.isArray(rec.elements)) collectCustomerIds(ids, rec.elements);
}
