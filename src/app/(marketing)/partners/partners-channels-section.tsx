import Link from "next/link";
import { ArrowRight, Handshake, Store, Users, Zap, Globe } from "lucide-react";
import { PARTNERSHIP_CHANNELS } from "@/lib/phase6/partnerships-data";
const CHANNEL_ICONS = { pos: Store, association: Users, agency: Handshake, zapier: Zap, google: Globe } as const;

export function PartnersChannelsSection() {
    return (
        <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl space-y-8">
                    <h2 className="text-3xl font-bold text-foreground">Partnership channels</h2>
                    {PARTNERSHIP_CHANNELS.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel.icon];
                        return (
                            <article
                                key={channel.id}
                                className="bg-card border border-border rounded-2xl p-8 hover:border-primary/20 transition-colors"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 size-12">
                                            <Icon className="size-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{channel.title}</h3>
                                            <p className="text-sm text-muted-foreground">{channel.partnerType}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                            channel.status === "live"
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : channel.status === "in_progress"
                                                  ? "bg-muted text-muted-foreground border-border"
                                                  : "bg-muted text-muted-foreground border-border"
                                        }`}
                                    >
                                        {channel.status === "live"
                                            ? "Live"
                                            : channel.status === "in_progress"
                                              ? "In progress"
                                              : "Planned"}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    <strong className="text-foreground">Value exchange:</strong> {channel.valueExchange}
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground mb-6">
                                    {channel.actions.map((action) => (
                                        <li key={action}>{action}</li>
                                    ))}
                                </ul>
                                {channel.ctaHref && channel.ctaLabel && (
                                    <Link
                                        href={channel.ctaHref}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-90"
                                    >
                                        {channel.ctaLabel} <ArrowRight className="size-4" />
                                    </Link>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>
    );
}
