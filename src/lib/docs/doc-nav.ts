/**
 * Single source of truth for docs IA (sidebar + command palette).
 * Keep hrefs in sync with routes under `src/app/docs/` (each `page.tsx`).
 */

export type DocIconKey =
    | "file"
    | "zap"
    | "sparkles"
    | "cpu"
    | "network"
    | "code"
    | "book"
    | "plug"
    | "history";

export type DocNavItem = {
    title: string;
    href: string;
    icon?: DocIconKey;
};

export type DocNavGroup = {
    title: string;
    items: DocNavItem[];
};

export const DOC_NAV_GROUPS: DocNavGroup[] = [
    {
        title: "Getting Started",
        items: [
            { title: "Overview", href: "/docs", icon: "file" },
            { title: "Quickstart", href: "/docs/quickstart", icon: "zap" },
            { title: "Use with AI", href: "/docs/install", icon: "sparkles" },
        ],
    },
    {
        title: "Concepts",
        items: [
            { title: "How Zyene Works", href: "/docs/how-it-works", icon: "cpu" },
            { title: "Review Graph", href: "/docs/graph" },
            { title: "Content Types", href: "/docs/content-types" },
            { title: "Sync Networks", href: "/docs/sync", icon: "network" },
        ],
    },
    {
        title: "Reference",
        items: [
            { title: "API Reference", href: "/docs/api", icon: "code" },
            { title: "Cookbook", href: "/docs/cookbook", icon: "book" },
        ],
    },
    {
        title: "Product",
        items: [
            { title: "Plugins & embeds", href: "/docs/plugins", icon: "plug" },
            { title: "Changelog", href: "/docs/changelog", icon: "history" },
        ],
    },
];

export type DocSearchHit = DocNavItem & { group: string };

export const DOC_SEARCH_INDEX: DocSearchHit[] = DOC_NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.title }))
);
