import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import type { FaqItem } from "@/components/seo/json-ld";

export interface ToolGuideContent {
    slug: string;
    about: { title: string; paragraphs: ReactNode[] };
    steps: { title: string; items: { icon: LucideIcon; label: string; text: ReactNode }[] };
    tips: { title: string; paragraphs: ReactNode[] };
    faqs: FaqItem[];
    related: { href: string; label: string; note: string }[];
}

/** Shared layout for the guide below each free tool: about, steps, tips, FAQ and related reading. */
export function ToolGuide({ content }: { content: ToolGuideContent }) {
    const { slug, about, steps, tips, faqs, related } = content;
    return (
        <>
            <section className="marketing-section" aria-labelledby={`${slug}-about-heading`}>
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">About this tool</p>
                        <h2 id={`${slug}-about-heading`}>{about.title}</h2>
                    </div>
                    <div className="mk-prose">
                        {about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby={`${slug}-steps-heading`}>
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">How it works</p>
                        <h2 id={`${slug}-steps-heading`}>{steps.title}</h2>
                    </div>
                    <ol className="mi-list">
                        {steps.items.map(({ icon: Icon, label, text }, index) => (
                            <li key={label}>
                                <Icon size={18} aria-hidden="true" />
                                <div>
                                    <h3><span className="sr-only">Step {index + 1}: </span>{label}</h3>
                                    <p>{text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby={`${slug}-tips-heading`}>
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">In practice</p>
                        <h2 id={`${slug}-tips-heading`}>{tips.title}</h2>
                    </div>
                    <div className="mk-prose">
                        {tips.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                </div>
            </section>

            <MarketingFaqSection faqs={faqs} headingId={`${slug}-faq-heading`} />

            <section className="marketing-section mi-section-tight" aria-labelledby={`${slug}-related-heading`}>
                <div className="marketing-container">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Keep reading</p>
                        <h2 id={`${slug}-related-heading`}>Related guides &amp; resources</h2>
                    </div>
                    <ul className="mi-cards">
                        {related.map((item) => (
                            <li key={item.href} className="flex">
                                <Link href={item.href} className="mi-card w-full">
                                    <h3>{item.label}</h3>
                                    <p>{item.note}</p>
                                    <span className="home-text-link">
                                        Read <ArrowRight size={14} aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
