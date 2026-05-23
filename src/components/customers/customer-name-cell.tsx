"use client";

import * as React from "react";
import { Mail, Phone, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerNameCell({
    customer,
    display,
    hasName,
    isEditing,
    onCancelEdit,
    onSave,
}: {
    customer: Customer;
    display: string;
    hasName: boolean;
    isEditing: boolean;
    onCancelEdit: () => void;
    onSave: (draft: string) => void;
}) {
    const [draft, setDraft] = React.useState(() => (hasName ? display : ""));
    const skipBlurSave = React.useRef(false);

    React.useEffect(() => {
        if (!isEditing) {
            setDraft(hasName ? display : "");
        }
    }, [display, hasName, isEditing]);

    if (isEditing) {
        return (
            <div className="flex flex-col gap-1 min-w-[180px]">
                <Input
                    autoFocus
                    className="h-8 text-sm"
                    value={draft}
                    placeholder="Name"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onSave(draft);
                        }
                        if (e.key === "Escape") {
                            e.preventDefault();
                            skipBlurSave.current = true;
                            onCancelEdit();
                        }
                    }}
                    onBlur={() => {
                        if (skipBlurSave.current) {
                            skipBlurSave.current = false;
                            return;
                        }
                        onSave(draft);
                    }}
                />
                <div className="text-[10px] text-muted-foreground">
                    Enter to save · Esc to cancel · click away to save
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
            <div
                className="text-left rounded-md px-0 py-0.5 hover:bg-muted/40"
                role={isEditing ? undefined : "presentation"}
            >
                <div className="flex flex-wrap items-center gap-2">
                    {hasName ? (
                        <span className="font-medium text-foreground">{display}</span>
                    ) : (
                        <span className="font-normal text-muted-foreground">Unnamed Customer</span>
                    )}
                    {customer.is_opted_out ? (
                        <Badge
                            variant="outline"
                            className="h-5 border-chart-4/40 bg-chart-4/10 px-1.5 text-[10px] font-medium text-chart-4"
                        >
                            Opted out
                        </Badge>
                    ) : null}
                </div>
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
                {customer.email && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {customer.email}
                    </span>
                )}
                {customer.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {customer.phone}
                    </span>
                )}
            </div>
            </div>
            <ChevronRight
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-70"
                aria-hidden
            />
        </div>
    );
}
