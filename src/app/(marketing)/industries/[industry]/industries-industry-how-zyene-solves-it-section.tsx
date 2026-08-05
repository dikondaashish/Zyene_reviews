import { Bell, Sparkles, ShieldCheck, BarChart2 } from "lucide-react";
import type { IndustryData } from "@/lib/industries/industry-data";

const SOLUTION_ICONS = [Bell, Sparkles, ShieldCheck, BarChart2];

export function IndustriesIndustryHowZyeneSolvesItSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-foreground">
                        Everything a {data.nameSingular.toLowerCase()} needs
                    </h2>
                </div>

                <div className="flex flex-col gap-8">
                    {data.solutions.map((solution, i) => {
                        const Icon = SOLUTION_ICONS[i % SOLUTION_ICONS.length];
                        const isReversed = i % 2 === 1;

                        return (
                            <div
                                key={i}
                                className={`flex flex-col md:flex-row items-start gap-6 bg-card border border-border rounded-2xl p-8 ${
                                    isReversed ? "md:flex-row-reverse" : ""
                                }`}
                            >
                                <div className="shrink-0">
                                    <div className="bg-primary/10 p-3.5 rounded-xl">
                                        <Icon className="text-primary" size={28} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-foreground mb-2">
                                        {solution.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed max-w-lg">
                                        {solution.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
