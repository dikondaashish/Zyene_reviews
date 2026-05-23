import { ArrowRight, Clock } from "lucide-react";
import { COMING_INTEGRATIONS } from "./integrations-data";

export function IntegrationsComingSoonSection() {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Coming soon</h2>
                <p className="text-muted-foreground text-center mb-12">More integrations are on the roadmap. Join the waitlist.</p>
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {COMING_INTEGRATIONS.map((int) => (
                        <div key={int.name} className="bg-card border border-border rounded-2xl p-7 opacity-80">
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 opacity-60"
                                    style={{ backgroundColor: int.color }}
                                >
                                    {int.letter}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg leading-tight">{int.name}</h3>
                                    <span className="inline-block mt-1 bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-border">
                                        {int.badge}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{int.description}</p>
                            <ul className="space-y-2 mb-5">
                                {int.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="mailto:hello@zyenereviews.com?subject=Waitlist%20Interest"
                                className="text-sm font-medium text-primary hover:brightness-90 transition-colors inline-flex items-center gap-1"
                            >
                                Join waitlist <ArrowRight className="h-3 w-3" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
