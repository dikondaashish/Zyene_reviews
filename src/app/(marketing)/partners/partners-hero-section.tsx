import Link from "next/link";
import { ArrowRight, Handshake, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PARTNER_CONTACT_EMAIL } from "@/lib/phase6/partnerships-data";

export function PartnersHeroSection() {
    return (
        <section className="pt-24 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Handshake className="size-3" /> Partners
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Grow with Zyene Reviews
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Agencies, POS providers, associations, and automation platforms—partner with us to bring
                        affordable review management to local businesses.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Partnership%20inquiry`}>
                            <Button size="lg" className="rounded-xl px-8">
                                Contact partnerships <Mail className="ml-2 size-4" />
                            </Button>
                        </a>
                        <Link href="/agencies">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Agency program <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                        <Link href="/integrations">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Integrations
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
    );
}
