import type { Customer } from "@/components/customers/customer-table";

export function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export async function fetchAllCustomersForExport(businessId: string): Promise<Customer[]> {
    const limit = 5000;
    let page = 1;
    const all: Customer[] = [];
    for (;;) {
        const res = await fetch(
            `/api/customers?businessId=${encodeURIComponent(businessId)}&limit=${limit}&page=${page}`,
            { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.error || "Failed to load customers");
        }
        const payload = json.data;
        const batch = (payload.customers ?? []) as Customer[];
        all.push(...batch);
        if (batch.length < limit) break;
        page += 1;
        if (page > 500) break;
    }
    return all;
}

export function buildCustomerExportCsv(customers: Customer[]): string {
    const lines: string[] = [];
    lines.push(
        [
            "name",
            "email",
            "phone",
            "tags",
            "visits",
            "spend",
            "requests_sent",
            "last_sent_at",
            "has_reviewed",
        ].join(",")
    );
    for (const c of customers) {
        const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
        const tagStr = (c.tags ?? []).join("; ");
        const visits = String(c.visit_count ?? 0);
        const spend = ((c.total_spend_cents ?? 0) / 100).toFixed(2);
        const reqs = String(c.total_requests_sent ?? 0);
        const last = c.last_request_sent_at ?? "";
        const reviewed = c.has_linked_review ? "true" : "false";
        lines.push(
            [name, c.email ?? "", c.phone ?? "", tagStr, visits, spend, reqs, last, reviewed]
                .map((cell) => csvEscape(String(cell)))
                .join(",")
        );
    }
    return lines.join("\n");
}
