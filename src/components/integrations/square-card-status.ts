const STATUS_LABELS: Record<string, string> = {
    sent: "Review request sent",
    resolved: "Contact resolved (send off)",
    skipped_disabled: "Skipped — auto-send off",
    skipped_no_contact: "Skipped — no email/phone",
    skipped_guard: "Skipped — frequency cap",
    send_failed: "Send failed",
    error: "Error",
    received: "Received",
};

export function squarePaymentStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function squareLastEventSummary(args: {
    status: string;
    customerEmail: string | null;
    createdAt: string;
    timeAgo: (iso: string) => string;
}): string {
    const label = squarePaymentStatusLabel(args.status);
    const who = args.customerEmail ? ` · ${args.customerEmail}` : "";
    return `${label}${who} · ${args.timeAgo(args.createdAt)}`;
}
