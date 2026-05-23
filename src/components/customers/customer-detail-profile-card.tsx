"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { CustomerRow } from "@/components/customers/customer-detail-helpers";
import { CustomerDetailProfileIdentity } from "@/components/customers/customer-detail-profile-identity";
import { CustomerDetailProfileTagsSince } from "@/components/customers/customer-detail-profile-tags-since";

export function CustomerDetailProfileCard({
    customer,
    editingName,
    setEditingName,
    nameDraft,
    setNameDraft,
    skipBlurNameRef,
    saveName,
    avatarText,
    avatarCompact,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
}: {
    customer: CustomerRow;
    editingName: boolean;
    setEditingName: (v: boolean) => void;
    nameDraft: string;
    setNameDraft: (v: string) => void;
    skipBlurNameRef: React.MutableRefObject<boolean>;
    saveName: () => void | Promise<void>;
    avatarText: string;
    avatarCompact: boolean;
    tags: string[];
    tagInput: string;
    setTagInput: (v: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_100%_0%,var(--primary)_0%,transparent_55%)] opacity-[0.06]"
                aria-hidden
            />
            <div className="relative border-b border-border/60 bg-muted/20 px-5 py-5 sm:px-8 sm:py-7">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                    <div
                        className={cn(
                            "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/18 to-primary/5 ring-2 ring-primary/12 ring-offset-2 ring-offset-card",
                            avatarCompact ? "h-[4.75rem] w-[4.75rem]" : "h-[5.25rem] w-[5.25rem]"
                        )}
                    >
                        <span
                            className={cn(
                                "font-semibold tracking-tight text-primary",
                                avatarCompact ? "text-base tabular-nums" : "text-xl"
                            )}
                        >
                            {avatarText}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-5">
                        <CustomerDetailProfileIdentity
                            customer={customer}
                            editingName={editingName}
                            setEditingName={setEditingName}
                            nameDraft={nameDraft}
                            setNameDraft={setNameDraft}
                            skipBlurNameRef={skipBlurNameRef}
                            saveName={saveName}
                        />
                        <CustomerDetailProfileTagsSince
                            customer={customer}
                            tags={tags}
                            tagInput={tagInput}
                            setTagInput={setTagInput}
                            addTag={addTag}
                            removeTag={removeTag}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
