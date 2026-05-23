import { Bot, Globe, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";
import type { IndustryData } from "@/lib/phase3/industry-data";

const SOLUTIONS_ICONS = [ShieldCheck, Bot, Star, TrendingUp, Globe, Sparkles];

export function IndustriesIndustryHowZyeneSolvesItSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-4">
                            <Sparkles className="h-3.5 w-3.5" /> How Zyene solves it
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">
                            Everything a {data.nameSingular.toLowerCase()} needs
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {data.solutions.map((solution, i) => {
                            const Icon = SOLUTIONS_ICONS[i % SOLUTIONS_ICONS.length];
                            return (
                                <div key={i} className="bg-card border border-border rounded-2xl p-7 flex gap-5">
                                    <div className="bg-primary/10 p-3 rounded-xl h-fit shrink-0">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">{solution.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
    );
}
