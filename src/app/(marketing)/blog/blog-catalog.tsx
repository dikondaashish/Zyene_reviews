"use client";

import { useMemo, useState } from "react";
import type { ContentPillar, BlogPost } from "@/lib/content/blog-types";
import { BlogPillarFiltersSection } from "./blog-pillar-filters-section";
import { BlogAllPostsGridSection } from "./blog-all-posts-grid-section";

export function BlogCatalog({ posts }: { posts: BlogPost[] }) {
    const [activePillar, setActivePillar] = useState<ContentPillar | "all">("all");
    const [query, setQuery] = useState("");
    const filteredPosts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return posts.filter((post) => {
            const matchesPillar = activePillar === "all" || post.pillar === activePillar;
            const searchableText = `${post.title} ${post.excerpt} ${post.pillarLabel}`.toLowerCase();
            return matchesPillar && (!normalizedQuery || searchableText.includes(normalizedQuery));
        }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    }, [activePillar, posts, query]);
    const resetAndSetPillar = (pillar: ContentPillar | "all") => {
        setActivePillar(pillar);
    };
    const resetAndSetQuery = (value: string) => {
        setQuery(value);
    };

    return (
        <>
            <BlogPillarFiltersSection activePillar={activePillar} query={query} onPillarChange={resetAndSetPillar} onQueryChange={resetAndSetQuery} />
            <BlogAllPostsGridSection posts={filteredPosts} />
        </>
    );
}
