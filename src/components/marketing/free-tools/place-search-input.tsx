"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

export type PlaceSuggestion = {
    placeId: string;
    primaryText: string;
    secondaryText: string;
};

export function PlaceSearchInput({
    onSelect,
    placeholder = "Search your business on Google Maps…",
}: {
    onSelect: (place: PlaceSuggestion | null) => void;
    placeholder?: string;
}) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<PlaceSuggestion | null>(null);

    useEffect(() => {
        if (selected || query.length < 2) {
            setSuggestions([]);
            return;
        }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/marketing/tools/places-search?q=${encodeURIComponent(query)}`
                );
                const json = await res.json();
                setSuggestions(json.suggestions ?? []);
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query, selected]);

    function pick(place: PlaceSuggestion) {
        setSelected(place);
        setQuery(`${place.primaryText}${place.secondaryText ? `, ${place.secondaryText}` : ""}`);
        setSuggestions([]);
        onSelect(place);
    }

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelected(null);
                        onSelect(null);
                    }}
                    placeholder={placeholder}
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground size-4" />
                )}
            </div>
            {suggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-56 overflow-auto">
                    {suggestions.map((s) => (
                        <li key={s.placeId}>
                            <button
                                type="button"
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                                onClick={() => pick(s)}
                            >
                                <span className="font-medium text-foreground">{s.primaryText}</span>
                                {s.secondaryText && (
                                    <span className="block text-xs text-muted-foreground">{s.secondaryText}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
