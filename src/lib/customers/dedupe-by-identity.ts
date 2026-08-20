import {
    customerIdentityMatches,
    normalizeCustomerEmail,
    normalizeCustomerPhone,
    type CustomerIdentity,
} from "@/lib/customers/identity";

export type CustomerWithIdentity = CustomerIdentity & {
    id: string;
    created_at: string;
    total_requests_sent?: number | null;
};

function identityKey(customer: CustomerIdentity): string | null {
    const email = normalizeCustomerEmail(customer.email);
    if (email) return `email:${email}`;
    const phone = normalizeCustomerPhone(customer.phone);
    if (phone) return `phone:${phone}`;
    return null;
}

function keepPreferred<T extends CustomerWithIdentity>(left: T, right: T): T {
    const leftRequests = left.total_requests_sent ?? 0;
    const rightRequests = right.total_requests_sent ?? 0;
    if (rightRequests !== leftRequests) {
        return rightRequests > leftRequests ? right : left;
    }
    return new Date(right.created_at).getTime() > new Date(left.created_at).getTime() ? right : left;
}

/** Collapse duplicate contacts that share the same normalized email or phone. */
export function dedupeCustomersByIdentity<T extends CustomerWithIdentity>(customers: T[]): T[] {
    const keyed = new Map<string, T>();
    const unkeyed: T[] = [];

    for (const customer of customers) {
        const key = identityKey(customer);
        if (!key) {
            unkeyed.push(customer);
            continue;
        }
        const existing = keyed.get(key);
        keyed.set(key, existing ? keepPreferred(existing, customer) : customer);
    }

    return [...keyed.values(), ...unkeyed].toSorted(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export function findDuplicateCustomerIds<T extends CustomerWithIdentity>(customers: T[]): Set<string> {
    const groups = new Map<string, T[]>();

    for (const customer of customers) {
        const key = identityKey(customer);
        if (!key) continue;
        const group = groups.get(key) ?? [];
        group.push(customer);
        groups.set(key, group);
    }

    const duplicateIds = new Set<string>();
    for (const group of groups.values()) {
        if (group.length < 2) continue;
        const primary = group.reduce((best, current) => keepPreferred(best, current));
        for (const customer of group) {
            if (customer.id !== primary.id) duplicateIds.add(customer.id);
        }
    }

    return duplicateIds;
}

export function customersShareIdentity(left: CustomerIdentity, right: CustomerIdentity): boolean {
    return customerIdentityMatches(left, right);
}
