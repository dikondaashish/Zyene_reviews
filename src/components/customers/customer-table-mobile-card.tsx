"use client";

import Link from "next/link";
import type { Row } from "@tanstack/react-table";
import { Mail, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerTableMobileMetrics } from "@/components/customers/customer-table-mobile-metrics";
import { Badge } from "@/components/ui/badge";
import { CustomerActionsDropdown } from "@/components/customers/customer-actions-dropdown";
import { CustomerTagsCell } from "@/components/customers/customer-tags-cell";
import {
    customerDisplayName,
    tagPillClass,
    type Customer,
} from "@/components/customers/customer-table-types";

export function CustomerTableMobileCard({
    row,
    showVisitsSpend,
    saveTags,
    setEditingNameId,
    onSendRequest,
    setDeleteTarget,
    setMergeTarget,
    setOptedOut,
    onNavigate,
    onActivate,
}: {
    row: Row<Customer>;
    showVisitsSpend: boolean;
    saveTags: (customer: Customer, tags: string[]) => void | Promise<void>;
    setEditingNameId: (id: string | null) => void;
    onSendRequest?: (customer: Customer) => void;
    setDeleteTarget: (customer: Customer | null) => void;
    setMergeTarget: (customer: Customer | null) => void;
    setOptedOut: (customer: Customer, value: boolean) => void | Promise<void>;
    onNavigate: (e: React.MouseEvent, customerId: string) => void;
    onActivate: (customerId: string) => void;
}) {
    const customer = row.original;
    const display = customerDisplayName(customer);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={(e) => onNavigate(e, customer.id)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onActivate(customer.id);
                }
            }}
            className="cursor-pointer rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/20 sm:p-4"
        >
            <div className="flex min-w-0 items-start gap-3">
                <div onClick={(e) => e.stopPropagation()} className="shrink-0 pt-0.5">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
                <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="min-w-0 space-y-1">
                        <p className="break-words text-[15px] font-semibold leading-snug text-foreground">
                            {display || "Unnamed Customer"}
                        </p>
                        {customer.is_opted_out ? (
                            <Badge
                                variant="outline"
                                className="h-5 border-chart-4/40 bg-chart-4/10 px-1.5 text-[10px] font-medium text-chart-4"
                            >
                                Opted out
                            </Badge>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {customer.email ? (
                            <span className="inline-flex min-w-0 items-center gap-1 break-all">
                                <Mail className="shrink-0 size-3" />
                                {customer.email}
                            </span>
                        ) : null}
                        {customer.phone ? (
                            <span className="inline-flex items-center gap-1">
                                <Phone className="shrink-0 size-3" />
                                {customer.phone}
                            </span>
                        ) : null}
                    </div>
                    <CustomerTagsCell
                        customer={customer}
                        onSaveTags={saveTags}
                        tagPillClass={tagPillClass}
                        className="w-full max-w-full"
                    />
                    <CustomerTableMobileMetrics customer={customer} showVisitsSpend={showVisitsSpend} />
                    <div
                        className="flex items-center justify-between gap-2 border-t border-border pt-2.5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Link
                            href={`/customers/${customer.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            View details
                        </Link>
                        <CustomerActionsDropdown
                            customer={customer}
                            onEditName={() => setEditingNameId(customer.id)}
                            onSendRequest={() => onSendRequest?.(customer)}
                            onDelete={() => setDeleteTarget(customer)}
                            onMerge={() => setMergeTarget(customer)}
                            setOptedOut={setOptedOut}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
