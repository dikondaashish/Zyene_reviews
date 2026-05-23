import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Bot, ShieldCheck, BarChart3, TrendingUp, Sparkles,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Zap, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INTEGRATIONS } from "./features-data";

export function FeaturesIntegrationsBarSection() {
    return (
        <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
                        Connects with the platforms you already use
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        {INTEGRATIONS.map((int) => (
                            <div
                                key={int.name}
                                className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 hover:shadow-sm transition-shadow"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: int.color }}
                                >
                                    {int.letter}
                                </div>
                                <span className="text-sm font-medium text-foreground">{int.name}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/integrations">
                        <Button variant="outline" className="gap-2">
                            See all integrations <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
    );
}
