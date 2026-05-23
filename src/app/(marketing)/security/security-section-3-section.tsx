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

export function SecuritySection3Section() {
    return (
        <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-3">Questions about security?</h2>
                    <p className="text-muted-foreground mb-6">
                        Enterprise customers can request our security overview, DPA, and subprocessors list.
                    </p>
                    <a
                        href="mailto:security@zyenereviews.com?subject=Security%20inquiry"
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:brightness-90"
                    >
                        <Mail className="h-4 w-4" />
                        security@zyenereviews.com
                    </a>
                </div>
            </section>
    );
}
