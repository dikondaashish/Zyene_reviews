import type { ReactNode } from "react";

export type InteriorHeroVariant =
    | "product"
    | "story"
    | "directory"
    | "support"
    | "conversion"
    | "reading";

export type HeroMedia =
    | {
        kind: "photo";
        src: string;
        alt: string;
        caption?: string;
        objectPosition?: string;
        priority?: boolean;
    }
    | { kind: "product"; node: ReactNode; label: string }
    | { kind: "none" };
