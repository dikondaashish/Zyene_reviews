import "@/app/(marketing)/marketing.css";

import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { ArrowRight } from "lucide-react";
import { MarketingLayoutHeader } from "@/app/(marketing)/marketing-layout-header";
import { MarketingLayoutFooter } from "@/app/(marketing)/marketing-layout-footer";

/* Same type voice as the marketing layout; this page renders outside it. */
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
    title: "Page not found",
    robots: { index: false, follow: true },
};

const HELPFUL_LINKS = [
    { href: "/pricing", label: "Pricing" },
    { href: "/features", label: "Features" },
    { href: "/blog", label: "Blog" },
    { href: "/help", label: "Help center" },
    { href: "/contact", label: "Contact us" },
];

export default function NotFound() {
    return (
        <div className={`${geist.variable} marketing-site flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-background text-foreground`}>
            <a href="#main-content" className="marketing-skip-link marketing-button sr-only focus:not-sr-only">Skip to content</a>
            <MarketingLayoutHeader />
            <main id="main-content" tabIndex={-1} className="marketing-content min-w-0 flex-1">
                <section className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-24 text-center sm:px-8">
                    <div className="container mx-auto max-w-2xl">
                        <p className="text-[clamp(6rem,22vw,11rem)] font-semibold leading-none tracking-tight text-primary/20 select-none" aria-hidden="true">
                            404
                        </p>
                        <h1 className="-mt-6 text-foreground">Page not found</h1>
                        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground leading-relaxed">
                            The page you&apos;re looking for doesn&apos;t exist or may have moved.
                        </p>
                        <div className="mt-10">
                            <Link href="/" className="marketing-button">
                                Back to homepage <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                        <nav aria-label="Helpful links" className="mt-12">
                            <p className="text-sm font-medium text-foreground">Or try one of these pages</p>
                            <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
                                {HELPFUL_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-foreground underline decoration-primary underline-offset-4 hover:decoration-2">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </section>
            </main>
            <MarketingLayoutFooter />
        </div>
    );
}
