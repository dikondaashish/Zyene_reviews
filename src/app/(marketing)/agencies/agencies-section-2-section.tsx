import { Palette } from "lucide-react";
import { WHITE_LABEL_FEATURES } from "@/lib/enterprise/agency-pricing-data";

export function AgenciesSection2Section() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Palette className="text-primary size-8" />
                        <h2 className="text-3xl font-bold">White-label branding</h2>
                    </div>
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                        Put your agency’s identity first with unbranded review collection flows. Enterprise client accounts also unlock white-label widgets, creating a consistent experience from the first request to the website.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {WHITE_LABEL_FEATURES.map((f) => (
                            <article key={f.title} className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
    );
}
