"use client";

import { ArrowRight, Check, CircleAlert, CircleCheck, MapPin, MessageSquare, Settings2, Star, Loader2, Plug, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBusinessAttention, type BusinessAttention } from "@/components/businesses/business-attention";
import { Button } from "@/components/ui/button";
import { BusinessIdentity } from "@/components/businesses/business-identity";
import { BusinessGoogleStatus } from "@/components/businesses/business-google-status";
import { DeleteBusinessButton } from "@/components/businesses/delete-business-button";
import type { BusinessDestination, BusinessDirectoryEntry } from "@/types/business-directory";

export function BusinessDirectoryRow({ business, isActive, canDelete, disabled, opening, onOpen }: {
    business: BusinessDirectoryEntry;
    isActive: boolean;
    canDelete: boolean;
    disabled: boolean;
    opening: boolean;
    onOpen: (destination: BusinessDestination) => void;
}) {
    const attention = getBusinessAttention(business);
    return (
        <li className={isActive ? "bg-primary/[0.025]" : ""}>
            <article aria-label={business.name} className="px-5 pt-5 sm:px-6 sm:pt-6">
                <div className="grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_140px_190px_170px]">
                    <div className="flex min-w-0 items-start gap-3.5">
                        <BusinessIdentity name={business.name} logoUrl={business.logoUrl} />
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h3 className="ui-card-title break-words [overflow-wrap:anywhere]">{business.name}</h3>
                                {isActive && <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary"><Check className="size-3" />Viewing now</span>}
                                {business.status && business.status !== "active" && <span className="text-xs capitalize text-muted-foreground">{business.status}</span>}
                            </div>
                            <p className="mt-1 text-xs capitalize text-muted-foreground">{business.category}</p>
                            {business.address && <p className="mt-1.5 flex items-start gap-1 text-xs leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 size-3 shrink-0" aria-hidden="true" /><span className="break-words">{business.address}</span></p>}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-5 xl:contents">
                        <BusinessReputation rating={business.rating} reviewCount={business.reviewCount} />
                        <BusinessGoogleStatus status={business.googleStatus} />
                    </div>
                    <Button variant={isActive ? "default" : "outline"} disabled={disabled}
                        onClick={() => onOpen("/dashboard")} aria-label={`Open dashboard for ${business.name}`}
                        className="w-full gap-2 rounded-lg xl:w-auto xl:justify-self-end">
                        {opening ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : null}
                        {opening ? "Opening…" : "Open dashboard"}{!opening && <ArrowRight className="size-4" />}
                    </Button>
                </div>
                <div className="mt-5 flex flex-col gap-2 border-t border-border/50 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <AttentionLine attention={attention} disabled={disabled} onOpen={onOpen} />
                    <div className="flex flex-wrap items-center gap-x-1 lg:justify-end">
                        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onOpen("/reviews")} className="gap-1.5 px-2 text-xs text-muted-foreground">
                            <MessageSquare className="size-3.5" />Reviews
                        </Button>
                        {business.googleStatus === "connected" ? (
                            <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onOpen("/settings/integrations")} className="gap-1.5 px-2 text-xs text-muted-foreground">
                                <Plug className="size-3.5" />Connections
                            </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onOpen("/settings/business-information")} className="gap-1.5 px-2 text-xs text-muted-foreground"><Settings2 className="size-3.5" />Settings</Button>
                        <DeleteBusinessButton businessId={business.id} businessName={business.name} disabled={!canDelete || disabled} compact />
                    </div>
                </div>
            </article>
        </li>
    );
}

function BusinessReputation({ rating, reviewCount }: Pick<BusinessDirectoryEntry, "rating" | "reviewCount">) {
    return (
        <div>
            <p className="mb-1 text-[11px] text-muted-foreground xl:hidden">Rating</p>
            <div className="flex items-center gap-1.5">
                <Star className={`size-4 fill-current ${rating === null ? "text-muted-foreground/30" : "text-warning"}`} strokeWidth={0} aria-hidden="true" />
                <span className="font-semibold tabular-nums">{rating?.toFixed(1) ?? "No rating yet"}</span>
                {rating !== null && <span className="text-xs text-muted-foreground">/ 5</span>}
            </div>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">{reviewCount.toLocaleString("en-US")} {reviewCount === 1 ? "review" : "reviews"}</p>
        </div>
    );
}

const TONE: Record<BusinessAttention["tone"], { className: string; icon: typeof CircleCheck }> = {
    danger: { className: "bg-destructive/10 text-destructive", icon: TriangleAlert },
    warning: { className: "bg-warning/15 text-warning-foreground", icon: CircleAlert },
    ok: { className: "text-success", icon: CircleCheck },
};

/** The one thing to do for this location, in a sentence, with the button that does it. */
function AttentionLine({ attention, disabled, onOpen }: {
    attention: BusinessAttention;
    disabled: boolean;
    onOpen: (destination: BusinessDestination) => void;
}) {
    const { className, icon: Icon } = TONE[attention.tone];
    const action = attention.action;
    return (
        <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg text-sm", attention.tone !== "ok" && "px-3 py-2", className)}>
            <p className="flex min-w-0 items-start gap-2 font-medium">
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{attention.message}</span>
            </p>
            {action ? (
                <Button size="sm" variant="outline" disabled={disabled} onClick={() => onOpen(action.destination)}
                    className="h-8 gap-1.5 rounded-md bg-card text-foreground">
                    {action.label}<ArrowRight className="size-3.5" />
                </Button>
            ) : null}
        </div>
    );
}
