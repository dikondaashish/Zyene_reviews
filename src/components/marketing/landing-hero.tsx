import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroMedia as HeroMediaView } from "@/components/marketing/interior/hero-media";
import { SIGNUP_URL } from "@/config/env";
import type { HeroMedia, InteriorHeroVariant } from "@/types/marketing-interior";

type HeroAction = { label: string; href: string };

interface LandingHeroProps {
    eyebrow: string;
    title: ReactNode;
    description: string;
    variant?: InteriorHeroVariant;
    media?: HeroMedia;
    image?: { src: string; alt: string; caption?: string; objectPosition?: string };
    visual?: ReactNode;
    primary?: HeroAction;
    secondary?: HeroAction;
    children?: ReactNode;
}

function resolveHeroMedia(media: HeroMedia | undefined, visual: ReactNode, image: LandingHeroProps["image"]): HeroMedia {
    if (media) return media;
    if (visual) return { kind: "product", node: visual, label: "Interactive product demonstration" };
    if (image) return { kind: "photo", ...image };
    return { kind: "none" };
}

function resolveHeroVariant(variant: InteriorHeroVariant | undefined, media: HeroMedia): InteriorHeroVariant {
    if (variant) return variant;
    if (media.kind === "product") return "product";
    if (media.kind === "photo") return "story";
    return "directory";
}

export function LandingHero({ eyebrow, title, description, variant, media, image, visual, primary, secondary, children }: LandingHeroProps) {
    const resolvedMedia = resolveHeroMedia(media, visual, image);
    const resolvedVariant = resolveHeroVariant(variant, resolvedMedia);
    const hasMedia = resolvedMedia.kind !== "none";

    return (
        <section
            className={`landing-hero landing-hero--${resolvedVariant}${hasMedia ? " landing-hero-with-image" : ""}`}
            data-hero-media={resolvedMedia.kind}
        >
            <div className="marketing-container landing-hero-layout">
                <div className="landing-hero-copy">
                    <p className="marketing-eyebrow">{eyebrow}</p>
                    <h1>{title}</h1>
                    <p className="landing-hero-description">{description}</p>
                    {(primary || secondary) && (
                        <div className="marketing-actions">
                            {primary && (
                                <Link className="marketing-button" href={primary.href === "/signup" ? SIGNUP_URL : primary.href}>
                                    {primary.label} <ArrowRight aria-hidden="true" className="size-4" />
                                </Link>
                            )}
                            {secondary && <Link className="marketing-button marketing-button-secondary" href={secondary.href}>{secondary.label}</Link>}
                        </div>
                    )}
                    {children && <div className="landing-hero-extra">{children}</div>}
                </div>
                {hasMedia && <HeroMediaView media={resolvedMedia} />}
            </div>
        </section>
    );
}
