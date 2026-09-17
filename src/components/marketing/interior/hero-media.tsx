import Image from "next/image";

import type { HeroMedia as HeroMediaValue } from "@/types/marketing-interior";

export function HeroMedia({ media }: { media: Exclude<HeroMediaValue, { kind: "none" }> }) {
    if (media.kind === "product") {
        return (
            <div className="landing-hero-product" role="region" aria-label={media.label}>
                {media.node}
            </div>
        );
    }

    return (
        <figure className="landing-hero-figure">
            <div className="landing-hero-image">
                <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    priority={media.priority ?? true}
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 46vw, 616px"
                    style={{ objectPosition: media.objectPosition }}
                />
            </div>
            {media.caption && <figcaption>{media.caption}</figcaption>}
        </figure>
    );
}
