export interface Customer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    tags: string[] | null;
    visit_count: number | null;
    total_spend_cents: number | null;
    last_request_sent_at: string | null;
    total_requests_sent: number | null;
    created_at: string;
    /** Matched to `review_requests` with `review_left` for this business (phone/email). */
    has_linked_review?: boolean;
    /** Marketing / review-request opt-out (not carrier SMS registry). */
    is_opted_out?: boolean;
}

export interface CustomerTableProps {
    data: Customer[];
    businessId: string;
    onDelete?: (id: string) => void;
    onCustomerUpdated?: (customer: Customer) => void;
    onSendRequest?: (customer: Customer) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
}

const TAG_PILL_CLASSES = [
    "border-chart-1/35 bg-chart-1/12 text-chart-1",
    "border-chart-2/35 bg-chart-2/12 text-chart-2",
    "border-chart-3/35 bg-chart-3/12 text-chart-3",
    "border-chart-4/35 bg-chart-4/12 text-chart-4",
    "border-primary/35 bg-primary/12 text-primary",
    "border-chart-5/35 bg-chart-5/12 text-chart-5",
];

export function parseFullName(input: string): { first_name: string | null; last_name: string | null } {
    const t = input.trim();
    if (!t) return { first_name: null, last_name: null };
    const i = t.indexOf(" ");
    if (i === -1) return { first_name: t, last_name: null };
    const rest = t.slice(i + 1).trim();
    return { first_name: t.slice(0, i), last_name: rest || null };
}

export function customerDisplayName(c: Customer): string {
    return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
}

export function tagPillClass(tag: string): string {
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
    return TAG_PILL_CLASSES[h % TAG_PILL_CLASSES.length];
}
