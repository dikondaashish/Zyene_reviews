export type SquareResolvedContact = {
    email: string | null;
    phone: string | null;
    name: string | null;
};

/**
 * Pull email/phone/name from Square Payment / Customer JSON shapes.
 */
export function resolveContactFromSquarePayment(payment: unknown): SquareResolvedContact {
    const root = asRecord(payment);
    const customers: Record<string, unknown>[] = [];

    const embedded = asRecord(root?.customer);
    if (embedded) customers.push(embedded);

    let email: string | null = null;
    let phone: string | null = null;
    let name: string | null = null;

    for (const c of customers) {
        if (!email && typeof c.email_address === "string" && c.email_address.trim()) {
            email = c.email_address.trim();
        }
        if (!phone && typeof c.phone_number === "string" && c.phone_number.trim()) {
            phone = c.phone_number.trim();
        }
        if (!name) {
            const n = [c.given_name, c.family_name]
                .filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
                .join(" ")
                .trim();
            if (n) name = n;
        }
    }

    return { email, phone, name };
}

export function extractSquareCustomerId(payment: unknown): string | null {
    const root = asRecord(payment);
    if (typeof root?.customer_id === "string" && root.customer_id) return root.customer_id;
    const embedded = asRecord(root?.customer);
    if (typeof embedded?.id === "string" && embedded.id) return embedded.id;
    return null;
}

export function resolveContactFromSquareCustomer(customer: unknown): SquareResolvedContact {
    return resolveContactFromSquarePayment({ customer });
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}
