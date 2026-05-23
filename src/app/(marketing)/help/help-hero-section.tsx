import Link from "next/link";
import { ArrowRight, Mail, Search } from "lucide-react";
import type { Metadata } from "next";

export function HelpHeroSection() {
    return (
        <section className="bg-muted border-b border-border py-20 px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you?</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Browse guides by topic below, or email our support team—available Monday through Friday, 9am–6pm EST.
                    </p>
                    <a
                        href="mailto:support@zyenereviews.com"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-primary px-6 py-3 rounded-md font-medium hover:brightness-95 transition"
                    >
                        <Mail className="size-4" />
                        Email support@zyenereviews.com
                    </a>
                </div>
            </section>
    );
}
