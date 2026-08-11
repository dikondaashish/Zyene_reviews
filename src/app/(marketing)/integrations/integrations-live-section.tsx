import { Check } from "lucide-react";
import Image from "next/image";
import { LIVE_INTEGRATIONS } from "./integrations-data";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

export function IntegrationsLiveSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Live integrations</h2>
                <p className="text-muted-foreground text-center mb-12">Connect today, no waitlist, available on all paid plans.</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LIVE_INTEGRATIONS.map((int) => (
                        <div key={int.name} className="bg-card border border-border rounded-2xl p-7 flex flex-col hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-4 mb-4">
                                {int.domain ? (
                                    <Image
                                        src={getBrandLogoUrl(int.domain)}
                                        alt={`${int.name} logo`}
                                        width={48}
                                        height={48}
                                        className="rounded-xl shrink-0 size-12 object-contain"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 size-12"
                                        style={{ backgroundColor: int.color }}
                                    >
                                        {int.letter}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-foreground text-lg leading-tight">{int.name}</h3>
                                    <span className="inline-block mt-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                                        Live
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{int.description}</p>
                            <ul className="space-y-2">
                                {int.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Check className="text-primary shrink-0 mt-0.5 size-3.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
