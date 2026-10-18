import Image from "next/image";
import Link from "next/link";
import { Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import type { ContentSection } from "@/lib/content/blog-data";
import { SIGNUP_URL } from "@/config/env";
import { cn } from "@/lib/utils";
import { headingAnchor } from "@/lib/content/heading-anchor";
import { renderInlineContent } from "./render-inline-content";

/** Long-form guide, help and blog body. Styled by .mk-prose (marketing-prose.css); the blog layers .blog-article-content on top. */
export function ContentRenderer({ sections, className }: { sections: ContentSection[]; className?: string }) {
    return (
        <div className={cn("mk-prose", className)}>
            {sections.map((section) => {
                const sectionKey = JSON.stringify(section);
                switch (section.type) {
                    case "h2":
                        return (
                            <h2 key={sectionKey} id={headingAnchor(section)}>
                                {section.text}
                            </h2>
                        );
                    case "summary":
                        return (
                            <p key={sectionKey} className="mk-prose-summary" data-geo-summary="">
                                <span className="sr-only">Key takeaway: </span>
                                {renderInlineContent(section.text)}
                            </p>
                        );
                    case "h3":
                        return <h3 key={sectionKey}>{section.text}</h3>;
                    case "p":
                        return <p key={sectionKey}>{renderInlineContent(section.text)}</p>;
                    case "callout":
                        return (
                            <div key={sectionKey} className="mk-prose-note">
                                <p>{renderInlineContent(section.text)}</p>
                            </div>
                        );
                    case "ul":
                        return (
                            <ul key={sectionKey} className="mk-prose-ul">
                                {section.items?.map((item) => (
                                    <li key={item}>{renderInlineContent(item)}</li>
                                ))}
                            </ul>
                        );
                    case "ol":
                        return (
                            <ol key={sectionKey} className="mk-prose-ol">
                                {section.items?.map((item) => (
                                    <li key={item}>{renderInlineContent(item)}</li>
                                ))}
                            </ol>
                        );
                    case "tip":
                        return (
                            <div key={sectionKey} className="mk-prose-note mk-prose-note--icon">
                                <Lightbulb size={18} aria-hidden="true" />
                                <p>{renderInlineContent(section.text)}</p>
                            </div>
                        );
                    case "warning":
                        return (
                            <div key={sectionKey} className="mk-prose-note mk-prose-note--icon mk-prose-note--warning">
                                <AlertTriangle size={18} aria-hidden="true" />
                                <p>{renderInlineContent(section.text)}</p>
                            </div>
                        );
                    case "quote":
                        return (
                            <blockquote key={sectionKey} className="mk-prose-quote">
                                <p>{section.text}</p>
                            </blockquote>
                        );
                    case "cta": {
                        const isSignup = !section.ctaHref || section.ctaHref === "/signup" || section.ctaHref === SIGNUP_URL;
                        const ctaTarget = isSignup ? SIGNUP_URL : section.ctaHref!;
                        const isExt = section.ctaHref?.startsWith("https://") && !isSignup;
                        return (
                            <div key={sectionKey} className="mk-prose-note mk-prose-cta">
                                <p>{section.ctaLabel}</p>
                                <Link href={ctaTarget} className="marketing-button" {...(isSignup ? { "data-track": "trial", "data-track-location": section.ctaTrackLocation ?? "content-cta" } : {})}>
                                    {isExt ? "Read source" : (section.ctaButtonText ?? "Get Started")} <ArrowRight size={14} aria-hidden="true" />
                                </Link>
                            </div>
                        );
                    }
                    case "image":
                        return section.image ? (
                            <figure key={sectionKey} className="mk-prose-figure">
                                <Image src={section.image.src} alt={section.image.alt} width={section.image.width} height={section.image.height} sizes="(max-width: 768px) 100vw, 768px" />
                                {section.image.caption ? <figcaption>{section.image.caption}</figcaption> : null}
                            </figure>
                        ) : null;
                    case "table":
                        return (
                            <div key={sectionKey} className="overflow-x-auto mk-prose-table">
                                <table>
                                    <thead><tr>{section.table?.headers.map((h) => (<th key={h} scope="col">{h}</th>))}</tr></thead>
                                    <tbody>{section.table?.rows.map((row) => (<tr key={JSON.stringify(row)}>{row.map((cell, k) => (<td key={section.table?.headers[k] ?? cell}>{cell}</td>))}</tr>))}</tbody>
                                </table>
                            </div>
                        );
                    default: return null;
                }
            })}
        </div>
    );
}
