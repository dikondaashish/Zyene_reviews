"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { ILLUSTRATIVE_BRANDS } from "@/lib/social-proof/illustrative-brands-data";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

export function IllustrativeBrandsBar({
    title = "Brands that trust Zyene Reviews",
}: {
    title?: string;
}) {
    const [paused, setPaused] = useState(false);

    return (
        <section className="home-brands" aria-label={title}>
            <div className="marketing-container home-brands-heading">
                <p>{title}</p>
                <button
                    type="button"
                    className="home-brands-toggle"
                    aria-label={paused ? "Play brand carousel" : "Pause brand carousel"}
                    aria-controls="home-brands-track"
                    onClick={() => setPaused(!paused)}
                >
                    {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
                    <span>{paused ? "Play" : "Pause"}</span>
                </button>
            </div>
            <div className="home-brands-window" data-paused={paused}>
                <div id="home-brands-track" className="home-brands-track">
                    {[false, true].map((duplicate) => (
                        <ul key={String(duplicate)} className="home-brands-group" aria-hidden={duplicate || undefined}>
                            {ILLUSTRATIVE_BRANDS.map((brand) => (
                                <li key={brand.domain} className="home-brand">
                                    <Image
                                        src={getBrandLogoUrl(brand.domain)}
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="home-brand-logo"
                                        sizes="36px"
                                    />
                                    <div>
                                        <p className="home-brand-name">{brand.name}</p>
                                        <p className="home-brand-industry">{brand.industry}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            </div>

        </section>
    );
}
