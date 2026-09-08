"use client";

import { useMemo, useState } from "react";
import type { ContentPillar, BlogPost } from "@/lib/content/blog-types";
import { BlogPillarFiltersSection } from "./blog-pillar-filters-section";
import { BlogAllPostsGridSection } from "./blog-all-posts-grid-section";

const INITIAL_VISIBLE = 9;

export function BlogCatalog({ posts }: { posts: BlogPost[] }) {
    const [activePillar, setActivePillar] = useState<ContentPillar | "all">("all");
    const [query, setQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
    const filteredPosts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return posts.filter((post) => {
            const matchesPillar = activePillar === "all" || post.pillar === activePillar;
            const searchableText = `${post.title} ${post.excerpt} ${post.pillarLabel}`.toLowerCase();
            return matchesPillar && (!normalizedQuery || searchableText.includes(normalizedQuery));
        });
    }, [activePillar, posts, query]);
    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const resetAndSetPillar = (pillar: ContentPillar | "all") => {
        setActivePillar(pillar);
        setVisibleCount(INITIAL_VISIBLE);
    };
    const resetAndSetQuery = (value: string) => {
        setQuery(value);
        setVisibleCount(INITIAL_VISIBLE);
    };

    return (
        <>
            <BlogPillarFiltersSection activePillar={activePillar} query={query} onPillarChange={resetAndSetPillar} onQueryChange={resetAndSetQuery} />
            <BlogAllPostsGridSection posts={visiblePosts} totalCount={filteredPosts.length} hasMore={visibleCount < filteredPosts.length} onLoadMore={() => setVisibleCount((count) => count + 6)} />
        </>
    );
}
