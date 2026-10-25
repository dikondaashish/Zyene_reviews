"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OnboardingGoogleLocationInfo } from "@/types/components";
import { OnboardingStepCard } from "./onboarding-step-card";
import { BusinessLogo } from "@/components/competitors/business-logo";

/** Search only helps once the list no longer fits on one screen. */
const SEARCH_FROM = 6;

export function Step2LocationPicker({
    locations,
    advancing,
    onSelect,
    onNotListed,
}: {
    locations: OnboardingGoogleLocationInfo[];
    advancing: boolean;
    onSelect: (location: OnboardingGoogleLocationInfo) => void | Promise<void>;
    /** Back to the find-by-name form when the right business isn't on this Google account. */
    onNotListed?: () => void;
}) {
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const shown = q
        ? locations.filter((loc) => `${loc.businessName} ${loc.fullAddress}`.toLowerCase().includes(q))
        : locations;

    return (
        <OnboardingStepCard
            footer={onNotListed ? (
                <p className="w-full text-sm text-muted-foreground">
                    Don&apos;t see your business?{" "}
                    <button type="button" onClick={onNotListed} disabled={advancing} className="font-medium text-primary hover:underline">
                        Find it by name instead
                    </button>
                </p>
            ) : null}
            title="Which business should we help?"
            description={`We found ${locations.length} on your Google account. Pick the one to set up first; you can add the others later.`}
        >
            <div className="space-y-3">
                {locations.length >= SEARCH_FROM && (
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or address"
                            aria-label="Search your Google businesses"
                            className="h-11 pl-9"
                        />
                    </div>
                )}
                <ul className="max-h-[360px] divide-y divide-border overflow-y-auto rounded-lg border border-border">
                    {shown.length === 0 && (
                        <li className="py-6 text-center text-xs text-muted-foreground">No business matches &ldquo;{query}&rdquo;.</li>
                    )}
                    {shown.map((loc, idx) => (
                        <li key={loc.name || idx}>
                            <button
                                type="button"
                                onClick={() => void onSelect(loc)}
                                disabled={advancing}
                                className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                            >
                                <BusinessLogo name={loc.businessName || "Business"} website={null} className="size-9" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-foreground">{loc.businessName}</span>
                                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{loc.fullAddress}</span>
                                </span>
                                {advancing ? (
                                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
                                ) : (
                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </OnboardingStepCard>
    );
}
