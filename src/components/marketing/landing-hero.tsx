import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

type HeroAction = { label: string; href: string };

interface LandingHeroProps {
    eyebrow: string;
    title: ReactNode;
    description: string;
    image?: { src: string; alt: string };
    visual?: ReactNode;
    primary?: HeroAction;
    secondary?: HeroAction;
    children?: ReactNode;
}

export function LandingHero({ eyebrow, title, description, image, visual, primary, secondary, children }: LandingHeroProps) {
    return (
        <section className={`landing-hero ${image || visual ? "landing-hero-with-image" : ""}`}>
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
                {visual && <div className="landing-hero-product">{visual}</div>}
                {image && !visual && (
                    <div className="landing-hero-image">
                        <Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 767px) 100vw, 45vw" className="object-cover" />
                    </div>
                )}
            </div>
        </section>
    );
}
