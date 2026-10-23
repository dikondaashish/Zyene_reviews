"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OnboardingGoogleLocationInfo } from "@/types/components";

/** Search only helps once the list no longer fits on one screen. */
const SEARCH_FROM = 6;

export function Step2LocationPicker({
    locations,
    advancing,
    onSelect,
}: {
    locations: OnboardingGoogleLocationInfo[];
    advancing: boolean;
    onSelect: (location: OnboardingGoogleLocationInfo) => void | Promise<void>;
}) {
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const shown = q
        ? locations.filter((loc) => `${loc.businessName} ${loc.fullAddress}`.toLowerCase().includes(q))
        : locations;

    return (
        <div className="max-w-md mx-auto space-y-5 py-8">
            <div className="text-center space-y-2">
                <div className="rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto size-14">
                    <MapPin className="text-primary size-7" />
                </div>
                <p className="font-bold text-xl text-foreground">Which business should we help?</p>
                <p className="text-xs text-muted-foreground">
                    We found {locations.length} on your Google account. Pick the one to set up first; you can add the others later.
                </p>
            </div>
            {locations.length >= SEARCH_FROM && (
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or address"
                        aria-label="Search your Google businesses"
                        className="pl-9"
                    />
                </div>
            )}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {shown.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">No business matches &ldquo;{query}&rdquo;.</p>
                )}
                {shown.map((loc, idx) => (
                    <button
                        key={loc.name || idx}
                        type="button"
                        onClick={() => void onSelect(loc)}
                        disabled={advancing}
                        className="w-full text-left p-4 rounded-2xl border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/[0.03] transition-all flex items-center justify-between gap-3 group"
                    >
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{loc.businessName}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{loc.fullAddress}</p>
                        </div>
                        {advancing ? (
                            <Loader2 className="animate-spin text-primary size-4 shrink-0" />
                        ) : (
                            <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors size-4 shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
