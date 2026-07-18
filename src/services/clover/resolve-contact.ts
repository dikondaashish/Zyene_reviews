export type CloverResolvedContact = {
    email: string | null;
    phone: string | null;
    name: string | null;
};

type CloverEmail = { emailAddress?: string };
type CloverPhone = { phoneNumber?: string };
type CloverCustomer = {
    firstName?: string;
    lastName?: string;
    emailAddresses?: CloverEmail[];
    phoneNumbers?: CloverPhone[];
};

/**
 * Pull email/phone/name from Clover payment/order/customer JSON shapes.
 * Tolerant of expand variants used by `/payments/{id}?expand=...`.
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
            const e = c.emailAddresses?.find((x) => x.emailAddress?.trim())?.emailAddress?.trim();
            if (e) email = e;
        }
        if (!phone) {
            const p = c.phoneNumbers?.find((x) => x.phoneNumber?.trim())?.phoneNumber?.trim();
            if (p) phone = p;
        }
        if (!name) {
            const n = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
            if (n) name = n;
        }
    }

    return { email, phone, name };
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
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
