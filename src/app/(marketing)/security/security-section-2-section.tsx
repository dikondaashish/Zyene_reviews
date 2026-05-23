import type { Metadata } from "next";
import Link from "next/link";
import { SECURITY_SECTIONS } from "./security-data";

export function SecuritySection2Section() {
    return (
        <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-4xl space-y-10">
                    {SECURITY_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={section.title}
                                className="flex flex-col sm:flex-row gap-6 p-8 rounded-2xl border border-border bg-card hover:border-primary/20 transition-colors"
                            >
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">{section.title}</h2>
                                    <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
    );
}
