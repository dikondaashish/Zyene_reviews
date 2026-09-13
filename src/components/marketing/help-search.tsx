"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";

import { getHelpSearchResults, type HelpSearchItem } from "@/lib/marketing/help-search";

interface HelpSearchProps {
    items: HelpSearchItem[];
    popularPaths: string[];
}

export function HelpSearch({ items, popularPaths }: HelpSearchProps) {
    const [query, setQuery] = useState("");
    const searching = query.trim().length > 0;
    const results = searching
        ? getHelpSearchResults(items, query)
        : popularPaths.flatMap((path) => items.find((item) => item.path === path) ?? []);

    return (
        <section className="help-search" aria-labelledby="help-search-title">
            <div className="help-search-field">
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="help-search-input">Search help articles</label>
                <input
                    id="help-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search setup, replies, billing…"
                />
                {searching && (
                    <button type="button" onClick={() => setQuery("")} aria-label="Clear help search">
                        <X size={17} aria-hidden="true" />
                    </button>
                )}
            </div>

            <div className="help-search-results" aria-live="polite">
                <div className="help-search-heading">
                    <h2 id="help-search-title">{searching ? `${results.length} ${results.length === 1 ? "guide" : "guides"} found` : "Start with the essentials"}</h2>
                    {searching && <a href="#help-topics">All topics</a>}
                </div>
                {results.length > 0 ? (
                    <nav aria-label={searching ? "Help search results" : "Popular setup guides"}>
                        {results.map((item, index) => (
                            <Link key={item.path} href={item.path}>
                                <span className="help-guide-number">{String(index + 1).padStart(2, "0")}</span>
                                <span><strong>{item.title}</strong><small>{item.category}</small></span>
                                <ArrowUpRight aria-hidden="true" size={18} />
                            </Link>
                        ))}
                    </nav>
                ) : (
                    <div className="help-search-empty">
                        <p>No guides match “{query.trim()}”. Try another phrase or browse every help topic.</p>
                        <a href="#help-topics">Browse all help topics</a>
                    </div>
                )}
            </div>
        </section>
    );
}
