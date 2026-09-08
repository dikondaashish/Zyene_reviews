"use client";

import { Search } from "lucide-react";
import type { ContentPillar } from "@/lib/content/blog-data";
import { BLOG_PILLARS } from "./blog-data";

export function BlogPillarFiltersSection({
    activePillar,
    query,
    onPillarChange,
    onQueryChange,
}: {
    activePillar: ContentPillar | "all";
    query: string;
    onPillarChange: (pillar: ContentPillar | "all") => void;
    onQueryChange: (query: string) => void;
}) {
    return (
        <section className="blog-filter-bar" aria-label="Filter blog articles">
            <div className="marketing-container blog-filter-inner">
                <div className="blog-filter-pills" role="group" aria-label="Filter by topic">
                    {BLOG_PILLARS.map((pillar) => (
                        <button
                            key={pillar.id}
                            type="button"
                            className="blog-filter-pill"
                            data-active={activePillar === pillar.id}
                            aria-pressed={activePillar === pillar.id}
                            onClick={() => onPillarChange(pillar.id)}
                        >
                            {pillar.id === "all" ? "All" : pillar.label}
                        </button>
                    ))}
                </div>
                <label className="blog-search">
                    <Search size={15} aria-hidden="true" />
                    <span className="sr-only">Search blog posts</span>
                    <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search here..." />
                </label>
                </div>
        </section>
    );
}
