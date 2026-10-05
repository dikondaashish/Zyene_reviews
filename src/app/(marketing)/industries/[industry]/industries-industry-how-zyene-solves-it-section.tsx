import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { IndustryData } from "@/lib/industries/industry-data";
import { industryAccentTint, industryAccentVar } from "@/lib/industries/industry-accent-tokens";

export function IndustriesIndustryHowZyeneSolvesItSection({ data }: { data: IndustryData }) {
    const accent = industryAccentVar(data.accentColor);
    const tint = industryAccentTint(data.accentColor);

    return (
        <section className="marketing-section">
            <div className="marketing-container">
                <div className="marketing-section-heading">
                    <h2>Built around your<br />working day.</h2>
                    <p>
                        The tools to make reputation management a natural part of running your{" "}
                        {data.nameSingular.toLowerCase()}.
                    </p>
                </div>

                <div className="grid gap-x-20 md:grid-cols-2">
                    {data.solutions.map((solution, index) => (
                        <article
                            key={solution.title}
                            className="border-t border-border py-8 transition-colors duration-[180ms] hover:bg-card/40"
                        >
                            <span
                                className="mb-6 inline-grid place-items-center rounded px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]"
                                style={{ color: accent, background: tint }}
                            >
                                0{index + 1}
                            </span>
                            <h3 className="mb-4 text-2xl font-semibold tracking-tight">
                                {solution.title}
                            </h3>
                            <p className="max-w-lg text-muted-foreground">
                                {solution.description}
                            </p>
                        </article>
                    ))}
                </div>

                <Link
                    href="/features/ai-replies"
                    className="group inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4"
                >
                    Explore AI drafts and automatic Google replies
                    <ArrowRight className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" />
                </Link>
            </div>
        </section>
    );
}
