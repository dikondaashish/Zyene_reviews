"use client";

import { formatDistanceToNow } from "date-fns";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTableMobileMetrics({
    customer,
    showVisitsSpend,
}: {
    customer: Customer;
    showVisitsSpend: boolean;
}) {
    return (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-2.5 text-xs">
            <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Requests
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                    {customer.total_requests_sent ?? 0} sent
                </dd>
            </div>
            <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Last sent
                </dt>
                <dd className="mt-0.5 text-muted-foreground">
                    {customer.last_request_sent_at
                        ? formatDistanceToNow(new Date(customer.last_request_sent_at), { addSuffix: true })
                        : "Never"}
                </dd>
            </div>
            {showVisitsSpend ? (
                <>
                    <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Visits
                        </dt>
                        <dd className="mt-0.5">{customer.visit_count ?? 0}</dd>
                    </div>
                    <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Spend
                        </dt>
                        <dd className="mt-0.5">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format((customer.total_spend_cents ?? 0) / 100)}
                        </dd>
                    </div>
                </>
            ) : null}
        </dl>
    );
}
