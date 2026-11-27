import Link from "next/link";
import type { IndustryPageContent } from "@/lib/industries/industry-page-content";

export function IndustriesIndustryEditorialSection({
    sections,
}: {
    sections: NonNullable<IndustryPageContent["editorialSections"]>;
}) {
    if (sections.length === 0) return null;

    return (
        <>
            {sections.map((section) => (
                <section
                    key={section.id}
                    className="marketing-section"
                    aria-labelledby={section.id}
                >
                    <div className="marketing-container">
                        <div className="home-section-head">
                            {section.eyebrow ? (
                                <p className="marketing-eyebrow">{section.eyebrow}</p>
                            ) : null}
                            <h2 id={section.id}>{section.heading}</h2>
                        </div>
                        {section.intro ? <p className="mt-3 max-w-3xl text-muted-foreground">{section.intro}</p> : null}
                        {section.items?.length ? (
                            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-muted-foreground">
                                {section.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        ) : null}
                        {section.quotes?.length ? (
                            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {section.quotes.map((q) => (
                                    <div key={q.label} className="rounded-xl border bg-card p-5">
                                        <h3 className="text-sm font-semibold text-foreground">{q.label}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {section.links?.length ? (
                            <div className="mt-5 flex flex-wrap gap-4">
                                {section.links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        {link.label} →
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>
            ))}
        </>
    );
}

