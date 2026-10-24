"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessLogo } from "@/components/competitors/business-logo";
import { STEP2_US_STATES } from "@/components/onboarding/step2-form-constants";
import { useBusinessPlaceSearch } from "@/components/onboarding/use-business-place-search";
import { useOnboardingPreview } from "@/components/onboarding/onboarding-preview-context";
import { loadPlacePhoto } from "@/components/onboarding/load-place-photo";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";
import type { BusinessPlaceMatch } from "@/services/places/places-business-search";
import { cn } from "@/lib/utils";

const FILL = { shouldValidate: true, shouldDirty: true } as const;

/** Business name with Google suggestions: picking one fills the address, city and state too. */
export function Step2BusinessNameSearch({ form, disabled }: { form: UseFormReturn<StepBusinessLocationFormData>; disabled: boolean }) {
    const listId = useId();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const country = useWatch({ control: form.control, name: "country" }) || "US";
    const { matches, loading, error } = useBusinessPlaceSearch(query, country, open && !disabled);
    const { updatePreview } = useOnboardingPreview();
    const field = form.register("businessName");
    const nameError = form.formState.errors.businessName;
    const showList = open && (loading || matches.length > 0 || Boolean(error));

    const pick = (match: BusinessPlaceMatch) => {
        form.setValue("businessName", match.name.slice(0, 100), FILL);
        if (match.street) form.setValue("address", match.street.slice(0, 200), FILL);
        if (match.city) form.setValue("city", match.city.slice(0, 50), FILL);
        const matchCountry = match.country || country;
        form.setValue("country", matchCountry, FILL);
        const usState = (STEP2_US_STATES as readonly string[]).includes(match.state);
        if (matchCountry !== "US" || usState) form.setValue("state", match.state, FILL);
        if (match.phone) form.setValue("phone", match.phone, FILL);
        form.setValue("website", match.website ?? "");
        form.setValue("category", match.industry ?? "");
        setOpen(false);
        updatePreview({
            name: match.name, city: match.city, state: match.state, country: matchCountry, website: match.website,
            average_rating: match.rating, total_reviews: match.reviewCount, photoUrl: null, category: match.industry,
        });
        if (match.photoName) void loadPlacePhoto(match.photoName).then((photoUrl) => photoUrl && updatePreview({ photoUrl }));
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showList || matches.length === 0) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const step = e.key === "ArrowDown" ? 1 : -1;
            setHighlight((i) => (i + step + matches.length) % matches.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            pick(matches[highlight] ?? matches[0]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="space-y-1.5">
            <Label htmlFor="onboarding-business-name">Business name</Label>
            <div className="relative">
                <Input
                    id="onboarding-business-name"
                    {...field}
                    onChange={(e) => {
                        void field.onChange(e);
                        setQuery(e.target.value);
                        // Typing a new name means a different business: drop what the last pick filled in.
                        form.setValue("website", "");
                        form.setValue("category", "");
                        updatePreview({ name: e.target.value, website: null, photoUrl: null, average_rating: null, total_reviews: null, category: null });
                        setHighlight(0);
                        setOpen(true);
                    }}
                    onBlur={(e) => {
                        void field.onBlur(e);
                        setOpen(false);
                    }}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-activedescendant={showList && matches[highlight] ? `${listId}-${highlight}` : undefined}
                    aria-required="true"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? "onboarding-business-name-error" : "onboarding-business-name-hint"}
                    autoComplete="off"
                    placeholder="Start typing, e.g. Mendon Pizza"
                    disabled={disabled}
                    className="h-11"
                />
                {showList && (
                    <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                        <ul id={listId} role="listbox" aria-label="Businesses on Google" className="max-h-72 overflow-y-auto py-1">
                            {matches.map((match, index) => (
                                <li
                                    key={match.placeId}
                                    id={`${listId}-${index}`}
                                    role="option"
                                    aria-selected={index === highlight}
                                    // mousedown, not click: the input's blur would close the list first.
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        pick(match);
                                    }}
                                    onMouseEnter={() => setHighlight(index)}
                                    className={cn("flex cursor-pointer items-center gap-3 px-3 py-2.5", index === highlight && "bg-muted")}
                                >
                                    <BusinessLogo name={match.name} website={match.website} className="size-9" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-foreground">{match.name}</span>
                                        <span className="block truncate text-xs text-muted-foreground">{match.formattedAddress}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {loading && matches.length === 0 && (
                            <p className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground" role="status">
                                <Loader2 className="size-3.5 animate-spin" aria-hidden /> Searching Google…
                            </p>
                        )}
                        {error && <p className="px-3 py-3 text-xs text-muted-foreground">{error} You can type the details below.</p>}
                        <p className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">Results from Google</p>
                    </div>
                )}
            </div>
            {nameError ? (
                <p id="onboarding-business-name-error" className="text-xs text-destructive">{nameError.message}</p>
            ) : (
                <p id="onboarding-business-name-hint" className="text-xs text-muted-foreground">Pick your business and we fill in the rest.</p>
            )}
        </div>
    );
}
