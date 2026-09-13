import type { ContentSection } from "@/lib/content/blog-types";

/** Shared by article headings and navigation so punctuation cannot break links. */
export function headingAnchor(section: Pick<ContentSection, "id" | "text">): string {
    return section.id ?? (section.text ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
