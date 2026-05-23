import type { Metadata } from "next";
import Link from "next/link";
import {
    Shield,
    Lock,
    Database,
    Globe,
    KeyRound,
    FileCheck,
    Mail,
    ArrowRight,
    ShieldCheck,
    Server,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function SecurityHeroSection() {
    return (
        <section className="pt-24 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-6">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Security &amp; trust
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Your reputation data deserves the same protection as your finances. Here is how Zyene Reviews
                        secures multi-tenant data, integrations, and customer information.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link href="/data-retention">
                            <Button variant="outline" className="gap-2">
                                Data retention policy <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/privacy">
                            <Button variant="ghost" className="gap-2 text-muted-foreground">
                                Privacy policy <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
    );
}
