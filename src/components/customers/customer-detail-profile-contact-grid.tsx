"use client";

import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerRow } from "@/components/customers/customer-detail-helpers";

export function CustomerDetailProfileContactGrid({ customer }: { customer: CustomerRow }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div
                className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                    customer.phone
                        ? "border-border/80 bg-background/80"
                        : "border-dashed border-muted-foreground/20 bg-muted/15"
                )}
            >
                <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-lg bg-muted/80 size-10">
                    <Phone className="text-muted-foreground size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                    {customer.phone ? (
                        <p className="mt-1 font-medium text-foreground tabular-nums">{customer.phone}</p>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Not set</p>
                    )}
                </div>
            </div>
            <div
                className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                    customer.email
                        ? "border-border/80 bg-background/80"
                        : "border-dashed border-muted-foreground/20 bg-muted/15"
                )}
            >
                <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-lg bg-muted/80 size-10">
                    <Mail className="text-muted-foreground size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                    {customer.email ? (
                        <p className="mt-1 break-all font-medium text-foreground">{customer.email}</p>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Not set</p>
                    )}
                </div>
            </div>
        </div>
    );
}
