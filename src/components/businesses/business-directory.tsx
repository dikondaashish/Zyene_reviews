"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessDirectoryRow } from "@/components/businesses/business-directory-row";
import { openBusiness as switchAndOpenBusiness } from "@/lib/auth/business-context";
import { attentionRank, needsAttention as businessNeedsAttention } from "@/components/businesses/business-attention";
import type { BusinessDestination, BusinessDirectoryEntry } from "@/types/business-directory";

export function BusinessDirectory({ businesses, activeBusinessId }: {
    businesses: BusinessDirectoryEntry[];
    activeBusinessId?: string | null;
}) {
    const [query, setQuery] = useState("");
    const [attentionOnly, setAttentionOnly] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [openingId, setOpeningId] = useState<string | null>(null);
    const router = useRouter();
    const needsAttention = businesses.filter(businessNeedsAttention).length;
    // Filters only help once there is something to filter; search only once the list is long.
    const showFilters = businesses.length > 1;
    const showSearch = businesses.length > 5;
    const search = query.trim().toLowerCase();
    const visible = businesses.filter((business) =>
        (!attentionOnly || businessNeedsAttention(business)) &&
        `${business.name} ${business.category} ${business.address}`.toLowerCase().includes(search)
    ).sort((a, b) => Number(b.id === activeBusinessId) - Number(a.id === activeBusinessId) || attentionRank(a) - attentionRank(b) || a.name.localeCompare(b.name));

    function openBusiness(id: string, destination: BusinessDestination) {
        if (isPending) return;
        setOpeningId(id);
        startTransition(async () => {
            try {
                // Switching re-renders on the server anyway, so let that response be the destination page.
                if (id !== activeBusinessId) await switchAndOpenBusiness(id, destination);
                else router.push(destination);
            } catch {
                toast.error("Could not open this business", { description: "Please try again." });
                setOpeningId(null);
            }
        });
    }

    return (
        <section aria-label="Business directory" className="min-w-0">
            {showFilters ? <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-1" aria-label="Filter businesses">
                    <Button variant="ghost" aria-pressed={!attentionOnly} onClick={() => setAttentionOnly(false)}
                        className={`gap-2 rounded-lg px-3 ${!attentionOnly ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                        All locations <span className="text-xs tabular-nums text-muted-foreground">{businesses.length}</span>
                    </Button>
                    <Button variant="ghost" aria-pressed={attentionOnly} onClick={() => setAttentionOnly(true)}
                        className={`gap-2 rounded-lg px-3 ${attentionOnly ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                        Needs attention <span className="text-xs tabular-nums text-muted-foreground">{needsAttention}</span>
                    </Button>
                </div>
                {showSearch ? <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search locations"
                        placeholder="Search locations…" className="h-10 rounded-lg bg-card pl-9 pr-10" />
                    {query && <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10" aria-label="Clear search" onClick={() => setQuery("")}><X className="size-4" /></Button>}
                </div> : null}
            </div> : null}
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                <div className="hidden grid-cols-[minmax(0,1fr)_140px_190px_170px] gap-5 border-b border-border/60 bg-accent/30 px-6 py-3 text-xs font-medium text-muted-foreground xl:grid" aria-hidden="true">
                    <span>Location</span><span>Rating</span><span>Google connection</span><span className="sr-only">Open</span>
                </div>
                {visible.length > 0 ? (
                    <ul className="divide-y divide-border/60">
                        {visible.map((business) => <BusinessDirectoryRow key={business.id} business={business}
                            isActive={business.id === activeBusinessId} canDelete={businesses.length > 1}
                            disabled={isPending} opening={isPending && openingId === business.id}
                            onOpen={(destination) => openBusiness(business.id, destination)} />)}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center px-6 py-14 text-center">
                        <Search className="mb-3 size-6 text-muted-foreground" aria-hidden="true" />
                        <h2 className="ui-section-title">{search ? "No matching locations" : "Nothing needs your attention"}</h2>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try another business name, category, or location." : "Every location is connected to Google and has no reviews waiting for a reply."}</p>
                        <Button variant="outline" className="mt-5 rounded-lg" onClick={() => { setQuery(""); setAttentionOnly(false); }}>Show all locations</Button>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
                    <span role="status">Showing {visible.length} of {businesses.length} {businesses.length === 1 ? "location" : "locations"}</span>
                    <span>Yours first, then the ones that need you most</span>
                </div>
            </div>
        </section>
    );
}
