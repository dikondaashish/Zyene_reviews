import Image from "next/image";

import type { IndustryData } from "@/lib/industries/industry-data";
import { industryAccentTint, industryAccentVar } from "@/lib/industries/industry-accent-tokens";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

interface Step {
    title: string;
    copy: string;
}

export function IndustriesIndustryUseCaseSection({ data }: { data: IndustryData }) {
    const steps: Step[] = [
        { title: "Starting point", copy: data.useCase.startingPoint },
        { title: "A better routine", copy: data.useCase.workflow },
        { title: "What to measure", copy: data.useCase.measures },
    ];
    const accent = industryAccentVar(data.accentColor);
    const tint = industryAccentTint(data.accentColor);
    const image = getIndustryImage(data.slug, data.name);

    return (
        <section className="marketing-section bg-muted border-t border-border">
            <div className="marketing-container story-row">
                <div className="story-visual" data-reveal>
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 767px) 100vw, 45vw"
                        className="object-cover"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: accent }}
                    />
                </div>

                <div className="feature-detail-copy">
                    <p
                        className="marketing-eyebrow mb-0 inline-flex items-center rounded-full px-3 py-1 text-[11px]"
                        style={{ color: accent, background: tint }}
                    >
                        An illustrative workflow
                    </p>
                    <h2 className="mt-4 tracking-tight">A better day at your {data.nameSingular.toLowerCase()}.</h2>

                    <ol className="feature-detail-list mt-6">
                        {steps.map((step, index) => (
                            <li
                                key={step.title}
                                className="flex items-start gap-4 border-t border-border py-5 text-sm"
                            >
                                <span
                                    className="mt-0.5 text-[12px] font-semibold tabular-nums"
                                    style={{ color: accent }}
                                >
                                    0{index + 1}
                                </span>
                                <div>
                                    <h3 className="mb-1 font-semibold tracking-tight">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.copy}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <p className="mt-5 text-xs text-muted-foreground">
                        This is not a customer testimonial or a promised result.
                    </p>
                </div>
            </div>
        </section>
    );
}
