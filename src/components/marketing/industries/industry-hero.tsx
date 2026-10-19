import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "@/app/(marketing)/industries/industries.css";

type HeroAction = { label: string; href: string; track?: string; trackLocation?: string };

interface IndustryHeroProps {
  /** Search phrase kept inside the H1, shown as a quiet line above the headline. */
  kicker: string;
  headline: string;
  lede: string;
  primary: HeroAction;
  secondary?: HeroAction;
  terms?: string;
  image: { src: string; alt: string };
  children?: ReactNode;
}

/**
 * Industry hero in the homepage language: short headline, one lede, two actions, one photo.
 * The photo sits beside the copy at roughly its native size. Our generated photos are 900 to 1024px
 * squares, so stretching them into a full-width banner (as this hero once did) upscales them about 2.8x.
 */
export function IndustryHero({ kicker, headline, lede, primary, secondary, terms, image, children }: IndustryHeroProps) {
  return (
    <section className="ind-hero">
      <div className="marketing-container ind-hero-split">
        <div className="ind-hero-copy">
          <h1 className="ind-hero-title">
            <span className="ind-hero-kicker">{kicker}</span>{" "}
            <span className="ind-hero-headline">{headline}</span>
          </h1>
          <div className="ind-hero-aside">
            <p className="ind-hero-lede">{lede}</p>
            <div className="ind-hero-actions">
              <Link
                href={primary.href}
                className="marketing-button"
                {...(primary.track ? { "data-track": primary.track, "data-track-location": primary.trackLocation ?? "hero" } : {})}
              >
                {primary.label} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {secondary && (
                <Link href={secondary.href} className="marketing-button marketing-button-secondary">
                  {secondary.label}
                </Link>
              )}
            </div>
            {terms && <p className="ind-hero-terms">{terms}</p>}
            {children && <div className="ind-hero-links">{children}</div>}
          </div>
        </div>
        <div className="ind-hero-photo">
          <Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 1023px) 100vw, 800px" />
        </div>
      </div>
    </section>
  );
}
