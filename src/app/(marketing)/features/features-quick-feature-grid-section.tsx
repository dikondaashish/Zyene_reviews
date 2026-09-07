import Link from "next/link";
import { PILLARS } from "@/app/(marketing)/features/features-data";

export function FeaturesQuickFeatureGridSection() {
    return (
        <section className="py-6 px-4 bg-muted border-y border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {PILLARS.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <Link
                                    key={pillar.id}
                                    href={`/features/${pillar.id}`}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all text-center group"
                                >
                                    <div className={"bg-primary/10 p-2 rounded-lg"}>
                                        <Icon className={"text-primary size-5"} />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{pillar.title.split("&")[0].trim()}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
    );
}
