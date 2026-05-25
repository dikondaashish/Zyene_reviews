import { COMPARE_HUB_BUYER_GUIDES } from "./compare-hub-content";

export function CompareHubHowToChooseSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border" aria-labelledby="compare-how-to-choose-heading">
            <div className="container mx-auto max-w-4xl">
                <h2 id="compare-how-to-choose-heading" className="text-3xl font-bold text-foreground text-center mb-3">
                    How to choose
                </h2>
                <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                    Match the platform to how you operate—not the logo on the slide deck. Pricing can vary by package,
                    contract terms, and location count; confirm with each vendor before you sign.
                </p>
                <ul className="space-y-6">
                    {COMPARE_HUB_BUYER_GUIDES.map((guide) => (
                        <li
                            key={guide.title}
                            className="rounded-2xl border border-border bg-card p-6 md:p-7"
                        >
                            <h3 className="text-lg font-semibold text-foreground mb-2">{guide.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{guide.body}</p>
                            {guide.pick ? (
                                <p className="text-sm text-foreground mt-3">
                                    <span className="font-semibold">Often starts with: </span>
                                    {guide.pick}
                                </p>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
