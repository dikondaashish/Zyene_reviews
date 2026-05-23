import { CUSTOMER_LOGOS } from "@/lib/phase5/social-proof-data";

export function CustomerLogoBar({ title = "Trusted by local businesses nationwide" }: { title?: string }) {
    return (
        <section className="w-full py-12 border-y border-border bg-muted/40">
            <div className="container mx-auto max-w-6xl px-4">
                <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-8">
                    {title}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                    {CUSTOMER_LOGOS.map((logo) => (
                        <div
                            key={logo.name}
                            className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity"
                            title={`${logo.name} · ${logo.industry}`}
                        >
                            <div
                                className={`rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 ${logo.colorClass} size-9`}
                            >
                                {logo.initials}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-semibold text-foreground leading-none">{logo.name}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{logo.industry}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
