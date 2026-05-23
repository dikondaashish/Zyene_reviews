import Link from "next/link";
import { Star } from "lucide-react";

const STATIC_REVIEWS = [
    { name: "Sarah M.", text: "Best experience we've had. Professional and fast.", stars: 5 },
    { name: "James T.", text: "They went above and beyond. Highly recommend.", stars: 5 },
    { name: "Lisa K.", text: "Great service—will definitely come back.", stars: 5 },
];

export function LiveWidgetPreview() {
    const slug = process.env.NEXT_PUBLIC_DEMO_WIDGET_SLUG;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const widgetSrc = slug && appUrl ? `${appUrl}/w/${slug}?type=carousel` : null;

    return (
        <section className="w-full py-20 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-foreground mb-2">See reviews live on your website</h2>
                    <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                        Embed a review carousel or star badge on your site—the same widget your customers&apos; visitors see.
                    </p>
                </div>
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                    {widgetSrc ? (
                        <iframe
                            src={widgetSrc}
                            title="Zyene Reviews widget preview"
                            className="w-full h-[280px] border-0"
                            loading="lazy"
                        />
                    ) : (
                        <div className="p-8 bg-gradient-to-br from-muted to-background">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex -space-x-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="fill-primary text-primary size-5" />
                                    ))}
                                </div>
                                <span className="text-lg font-bold text-foreground">4.8</span>
                                <span className="text-sm text-muted-foreground">· 94 Google reviews</span>
                            </div>
                            <div className="space-y-4">
                                {STATIC_REVIEWS.map((r) => (
                                    <div key={r.name} className="bg-background border border-border rounded-xl p-4">
                                        <div className="flex gap-0.5 mb-2">
                                            {Array.from({ length: r.stars }).map((_, i) => (
                                                <Star key={i} className="fill-primary text-primary size-3" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-foreground">{r.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">- {r.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="px-4 py-3 border-t border-border bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Powered by Zyene Reviews</span>
                        <Link href="/integrations" className="text-primary font-medium hover:brightness-90">
                            Get your widget →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
