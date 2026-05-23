"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle, MapPinned, Building2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { addCompetitor } from "@/app/actions/competitor";
import { Database } from "@/lib/db/supabase/database.types";
import type { PlacesAutocompleteSuggestion } from "@/services/places/places-autocomplete";
import { cn } from "@/lib/utils";

type Competitor = Database["public"]["Tables"]["competitors"]["Row"];

export function AddCompetitorDialog({
    businessId,
    onSuccess,
}: {
    businessId: string;
    onSuccess: (competitor: Competitor) => void;
}) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [googleUrl, setGoogleUrl] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [suggestions, setSuggestions] = useState<PlacesAutocompleteSuggestion[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const skipSuggestRef = useRef(false);
    const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const listId = "competitor-place-suggestions";

    const resetForm = useCallback(() => {
        setName("");
        setGoogleUrl("");
        setAddressLine("");
        setFieldErrors({});
        setSuggestions([]);
        setDropdownOpen(false);
        setLoadingSearch(false);
        skipSuggestRef.current = false;
    }, []);

    useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }
    }, [open, resetForm]);

    useEffect(() => {
        if (!open) return;

        if (skipSuggestRef.current) {
            skipSuggestRef.current = false;
            return;
        }

        const q = name.trim();
        if (q.length < 2) {
            setSuggestions([]);
            setLoadingSearch(false);
            return;
        }

        const t = setTimeout(async () => {
            setLoadingSearch(true);
            try {
                const res = await fetch(
                    `/api/places/autocomplete?q=${encodeURIComponent(q)}&region=us`,
                    { cache: "no-store" }
                );
                const data = (await res.json()) as {
                    suggestions?: PlacesAutocompleteSuggestion[];
                    error?: string;
                };
                if (!res.ok) {
                    if (res.status !== 401) {
                        toast.error(data.error || "Could not search places.");
                    }
                    setSuggestions([]);
                    return;
                }
                setSuggestions(data.suggestions ?? []);
            } catch {
                toast.error("Could not search places.");
                setSuggestions([]);
            } finally {
                setLoadingSearch(false);
            }
        }, 320);

        return () => clearTimeout(t);
    }, [name, open]);

    const handlePick = (s: PlacesAutocompleteSuggestion) => {
        if (blurTimerRef.current) {
            clearTimeout(blurTimerRef.current);
            blurTimerRef.current = null;
        }
        skipSuggestRef.current = true;
        setName(s.primaryText);
        setGoogleUrl(s.mapsUrl);
        setAddressLine(s.secondaryText);
        setSuggestions([]);
        setDropdownOpen(false);
        setFieldErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFieldErrors({});

        if (!name.trim()) {
            setFieldErrors({ name: "Competitor name is required" });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await addCompetitor(businessId, name, googleUrl);

            if (!result.success) {
                if (result.fieldError) {
                    setFieldErrors({
                        [result.fieldError.field]: result.fieldError.message,
                    });
                } else {
                    toast.error(result.error || "Couldn't add competitor. Please try again.");
                }
                return;
            }

            if (!result.data) {
                toast.error("Competitor was added but details could not be loaded. Refresh the page.");
                return;
            }

            toast.success("Competitor added successfully");
            onSuccess(result.data);
            setOpen(false);
            resetForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Track Competitor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="text-3xl tracking-tight">Add a Competitor</DialogTitle>
                        <DialogDescription>
                            Search on Google as you type, then pick the right listing. We will prefill the name and
                            Maps link; you can still edit before saving.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 px-6 py-4">
                        <div className="space-y-2 relative">
                            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Competitor name <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="name"
                                    role="combobox"
                                    aria-expanded={dropdownOpen && (suggestions.length > 0 || loadingSearch)}
                                    aria-controls={listId}
                                    aria-autocomplete="list"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setDropdownOpen(true);
                                        if (fieldErrors.name) {
                                            setFieldErrors({ ...fieldErrors, name: "" });
                                        }
                                    }}
                                    onFocus={() => setDropdownOpen(true)}
                                    onBlur={() => {
                                        blurTimerRef.current = setTimeout(() => setDropdownOpen(false), 180);
                                    }}
                                    placeholder="Start typing a business name…"
                                    required
                                    disabled={isSubmitting}
                                    autoComplete="off"
                                    className={cn(
                                        "h-11 pl-10",
                                        fieldErrors.name ? "border-destructive focus-visible:ring-destructive/30" : ""
                                    )}
                                />
                                {loadingSearch ? (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                ) : null}
                                {dropdownOpen &&
                                name.trim().length >= 2 &&
                                (suggestions.length > 0 || loadingSearch) ? (
                                    <div
                                        id={listId}
                                        role="listbox"
                                        className="absolute z-50 left-0 right-0 top-full mt-1 max-h-[280px] overflow-auto rounded-lg border bg-popover shadow-md"
                                    >
                                        {suggestions.map((s) => (
                                            <button
                                                key={s.placeId}
                                                type="button"
                                                role="option"
                                                className="w-full text-left px-3 py-2.5 hover:bg-muted/80 border-b last:border-b-0 flex gap-2 items-start transition-colors"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => handlePick(s)}
                                            >
                                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                <span className="min-w-0">
                                                    <span className="block font-medium text-sm leading-snug">
                                                        {s.primaryText}
                                                    </span>
                                                    {s.secondaryText ? (
                                                        <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                                                            {s.secondaryText}
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            {fieldErrors.name ? (
                                <div className="flex items-center gap-1 text-sm text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors.name}
                                </div>
                            ) : null}
                            {addressLine ? (
                                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{addressLine}</span>
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
                                <MapPinned className="h-4 w-4 text-muted-foreground" />
                                Google Maps URL
                            </Label>
                            <Input
                                id="url"
                                value={googleUrl}
                                onChange={(e) => {
                                    setGoogleUrl(e.target.value);
                                    if (fieldErrors.googleUrl) {
                                        setFieldErrors({ ...fieldErrors, googleUrl: "" });
                                    }
                                }}
                                placeholder="Filled when you pick a search result — or paste a link"
                                disabled={isSubmitting}
                                className={cn(
                                    "h-11",
                                    fieldErrors.googleUrl ? "border-destructive focus-visible:ring-destructive/30" : ""
                                )}
                            />
                            {fieldErrors.googleUrl ? (
                                <div className="flex items-start gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                    {fieldErrors.googleUrl}
                                </div>
                            ) : null}
                            <p className="text-xs text-muted-foreground">
                                Choosing a suggestion sets a verified Maps place link. You can edit or clear it if needed.
                            </p>
                        </div>

                        <div className="rounded-md border bg-muted/40 px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                                We will monitor their rating and review count automatically. First sync may take a few
                                minutes.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="px-6 pb-6 pt-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setFieldErrors({});
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[170px]">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Adding..." : "Add Competitor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
