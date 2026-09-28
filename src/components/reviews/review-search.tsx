"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewSearch({ query, onSearch }: { query: string; onSearch: (query: string) => void }) {
    const [value, setValue] = useState(query);
    return (
        <form role="search" onSubmit={(e) => { e.preventDefault(); onSearch(value.trim()); }} className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input aria-label="Search by reviewer name or review text" placeholder="Search reviews by name or keyword…" maxLength={200}
                    value={value} onChange={(e) => setValue(e.target.value)} className="h-10 bg-card pl-9 pr-10 text-sm" />
                {(value || query) && <button type="button" aria-label="Clear search" className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => { setValue(""); onSearch(""); }}><X className="size-4" /></button>}
            </div>
            <Button type="submit" variant="outline" className="h-10">Search</Button>
        </form>
    );
}
