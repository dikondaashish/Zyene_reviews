"use client";

import { ChevronDown } from "lucide-react";
import type { BlogFaq, ContentSection } from "@/lib/content/blog-types";
import { useState } from "react";

function slugifyHeading(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BlogSlugTableOfContents({ sections, faqs = [] }: { sections: ContentSection[]; faqs?: BlogFaq[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const headings = sections
        .filter((section) => section.type === "h2" && section.text)
        .map((section) => ({ label: section.text!, href: `#${slugifyHeading(section.text!)}` }));
    const hasFaqHeading = headings.some(({ label }) => label.toLowerCase().includes("frequently asked"));
    const items = faqs.length > 0 && !hasFaqHeading
        ? [...headings, { label: "FAQ", href: "#faq" }]
        : headings;

    return (
        <div className="blog-toc-card" data-open={isOpen} data-reveal>
            <button
                type="button"
                className="blog-toc-toggle"
                aria-expanded={isOpen}
                aria-controls="blog-toc-nav"
                onClick={() => setIsOpen((open) => !open)}
            >
                <span>Table of Contents</span>
                <ChevronDown className="size-5" aria-hidden="true" />
            </button>
            <h2 className="blog-toc-heading">Table of Contents</h2>
            <nav id="blog-toc-nav" className="blog-toc-nav" aria-label="Table of Contents">
                {items.map((item) => (
                    <a key={item.href} href={item.href} className="blog-toc-link" onClick={() => setIsOpen(false)}>
                        {item.label}
                    </a>
                ))}
            </nav>
        </div>
    );
}
