import React from "react";
import Link from "next/link";

/**
 * Render inline markdown-style links [label](url) within text blocks.
 */
export function renderInlineContent(text?: string): React.ReactNode {
    if (!text) return null;
    if (!text.includes("[")) return text;

    const parts: (string | React.ReactNode)[] = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const [, label, href] = match;
        const isExternal = href.startsWith("http");
        parts.push(
            <Link
                key={`${href}-${match.index}`}
                href={href}
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
                {label}
            </Link>
        );
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
