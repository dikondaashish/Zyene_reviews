import Link from "next/link";
import { ArrowRight, Code2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntegrationsHeroSection() {
    return (
        <section className="pt-24 pb-20 px-4 text-center bg-background">
            <div className="container mx-auto max-w-4xl">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                    <Zap className="size-3.5" />
                    Integrations
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                    Connects with the tools<br />
                    <span className="text-primary">you already use</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    From Google to your POS system, Zyene plugs into your existing workflow ,  so getting more reviews never requires changing how you work.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup">
                        <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                            Start Free Trial <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                    <Link href="/docs/api">
                        <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl gap-2">
                            <Code2 className="size-4" /> API Documentation
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
