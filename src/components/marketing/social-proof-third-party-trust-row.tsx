import { THIRD_PARTY_TRUST } from "@/lib/phase5/social-proof-data";

export function ThirdPartyTrustRow() {
    return (
        <section className="w-full py-16 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verified on the platforms you already trust</h2>
                    <p className="text-sm text-muted-foreground">
                        We&apos;re building our presence on third-party review sites—get early access and help shape our profile.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {THIRD_PARTY_TRUST.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                    {item.name}
                                </span>
                                {item.status === "coming_soon" && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                        Soon
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
