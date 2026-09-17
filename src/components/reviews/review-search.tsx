"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewSearch({ query, onSearch }: { query: string; onSearch: (query: string) => void }) {
    const [value, setValue] = useState(query);
    return <form role="search" onSubmit={(e) => { e.preventDefault(); onSearch(value.trim()); }} className="mb-3 flex flex-wrap gap-2">
        <Input aria-label="Search by reviewer name or review text" placeholder="Search reviewer or review text" maxLength={200} value={value} onChange={(e) => setValue(e.target.value)} className="min-w-0 flex-1 basis-48" />
        <Button type="submit" variant="outline">Search</Button>
        {query && <Button type="button" variant="ghost" onClick={() => { setValue(""); onSearch(""); }}>Clear</Button>}
    </form>;
}
