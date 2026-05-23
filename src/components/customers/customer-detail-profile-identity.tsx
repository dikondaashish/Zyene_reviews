"use client";

import * as React from "react";
import { UserRound, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { CustomerRow } from "@/components/customers/customer-detail-helpers";
import { displayName } from "@/components/customers/customer-detail-helpers";
import { CustomerDetailProfileContactGrid } from "@/components/customers/customer-detail-profile-contact-grid";

export function CustomerDetailProfileIdentity({
    customer,
    editingName,
    setEditingName,
    nameDraft,
    setNameDraft,
    skipBlurNameRef,
    saveName,
}: {
    customer: CustomerRow;
    editingName: boolean;
    setEditingName: (v: boolean) => void;
    nameDraft: string;
    setNameDraft: (v: string) => void;
    skipBlurNameRef: React.MutableRefObject<boolean>;
    saveName: () => void | Promise<void>;
}) {
    const name = displayName(customer);
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                    {editingName ? (
                        <div className="flex max-w-xl flex-col gap-2">
                            <Input
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        void saveName();
                                    }
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        skipBlurNameRef.current = true;
                                        setEditingName(false);
                                        setNameDraft(displayName(customer) || "");
                                    }
                                }}
                                onBlur={() => {
                                    if (skipBlurNameRef.current) {
                                        skipBlurNameRef.current = false;
                                        return;
                                    }
                                    void saveName();
                                }}
                                className="h-11 max-w-xl text-lg font-semibold"
                                autoFocus
                                placeholder="Full name"
                            />
                            <p className="text-xs text-muted-foreground">Enter to save · Esc to cancel</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setNameDraft(displayName(customer) || "");
                                    setEditingName(true);
                                }}
                                className="group block text-left"
                            >
                                {name ? (
                                    <span className="text-xl font-semibold tracking-tight text-foreground underline-offset-4 group-hover:underline sm:text-2xl">
                                        {name}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                                        <UserRound className="shrink-0 opacity-60 size-7" />
                                        Add a display name
                                        <ChevronRight className="opacity-0 transition-opacity group-hover:opacity-100 size-5" />
                                    </span>
                                )}
                            </button>
                            {!name && customer.phone && (
                                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                                    Showing phone below — add a name so this contact is easier to find.
                                </p>
                            )}
                            {customer.is_opted_out ? (
                                <Badge
                                    variant="outline"
                                    className="mt-2 w-fit border-chart-4/40 bg-chart-4/10 text-chart-4"
                                >
                                    Opted out of review requests
                                </Badge>
                            ) : null}
                        </div>
                    )}
                </div>

                <CustomerDetailProfileContactGrid customer={customer} />
        </div>
    );
}
