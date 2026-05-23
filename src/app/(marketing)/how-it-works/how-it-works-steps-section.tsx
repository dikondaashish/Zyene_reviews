import type { Metadata } from "next";
import Link from "next/link";
import {
    Link2, Bell, Megaphone, TrendingUp, ArrowRight, Check,
    Star, Sparkles, ShieldCheck, BarChart3,
} from "lucide-react";
import { STEPS } from "./how-it-works-data";

export function HowItWorksStepsSection() {
    return (
        <>
{STEPS.map((step, i) => {
                const Icon = step.icon;
                const isEven = i % 2 === 0;
                return (
                    <section
                        key={step.step}
                        id={`step-${step.step}`}
                        className={`py-20 px-4 scroll-mt-20 ${isEven ? "bg-background" : "bg-muted/40"} ${step.highlight ? "border-y border-primary/20" : "border-t border-border"}`}
                    >
                        <div className={`container mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center ${isEven ? "" : "lg:grid-flow-dense"}`}>
                            {/* Text */}
                            <div className={isEven ? "" : "lg:col-start-2"}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-6xl font-black text-primary/20 leading-none">{step.step}</span>
                                    <div className={`${step.iconBg} p-2.5 rounded-xl`}>
                                        <Icon className={`h-6 w-6 ${step.iconColor}`} />
                                    </div>
                                    <span className={`text-sm font-bold uppercase tracking-wider ${step.iconColor}`}>Step {step.step} — {step.title}</span>
                                </div>
                                <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">{step.headline}</h2>
                                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">{step.description}</p>
                                <ul className="space-y-3">
                                    {step.bullets.map((b) => (
                                        <li key={b} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Mockup */}
                            <div className={isEven ? "" : "lg:col-start-1 lg:row-start-1"}>
                                <div className={`rounded-2xl border-2 ${step.mockupBg} p-8 h-72 flex flex-col justify-center relative overflow-hidden`}>
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${step.accentColor} border-l-4`} />
                                    <div className="flex flex-col gap-4 pl-2">
                                        <div className={`flex items-center gap-3 ${step.iconBg} p-3 rounded-xl w-fit`}>
                                            <Icon className={`h-8 w-8 ${step.iconColor}`} />
                                            <span className="font-bold text-foreground text-lg">{step.title}</span>
                                        </div>
                                        <div className="space-y-3 font-mono text-sm text-muted-foreground bg-card/80 border border-border rounded-xl p-4">
                                            {step.mockupLines.map((line) => (
                                                <div key={line} className="text-foreground/80">{line}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
</>
    );
}
