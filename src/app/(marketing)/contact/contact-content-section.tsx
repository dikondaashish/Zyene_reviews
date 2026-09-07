import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";
import { ContactForm } from "@/app/(marketing)/contact/contact-form";

export function ContactContentSection() {
    return (
        <>
            <LandingHero eyebrow="Let’s talk" title="Real people. Ready to help." description="From your first review request to your next location, we’re here to help you get more from Zyene." />
            <section className="marketing-section">
                <div className="marketing-container grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
                    <div className="space-y-8">
                        <div className="relative aspect-[1.5] overflow-hidden rounded-2xl"><Image src="/marketing/about/team-collaboration.png" alt="A small business team working through ideas together" fill sizes="(max-width: 767px) 100vw, 40vw" /></div>
                        <div><h2 className="mb-3 text-2xl">How can we help?</h2><p className="text-muted-foreground">We typically reply within one business day, Monday through Friday.</p></div>
                        <div className="border-t border-border pt-6"><h3 className="mb-2 text-lg font-semibold">Product & account support</h3><a className="break-words text-primary underline underline-offset-4" href="mailto:support@zyenereviews.com">support@zyenereviews.com</a></div>
                        <div className="border-t border-border pt-6"><h3 className="mb-2 text-lg font-semibold">Let’s find your plan</h3><p className="mb-3 text-sm text-muted-foreground">Talk through your locations, team, and workflow.</p><Link href="/demo" className="inline-flex items-center gap-2 font-semibold text-primary">Book a demo <ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
                        <div className="border-t border-border pt-6"><h3 className="mb-2 text-lg font-semibold">Prefer to explore?</h3><Link href="/help" className="text-primary underline underline-offset-4">Browse the Help Center</Link></div>
                    </div>
                    <div className="order-first rounded-2xl border border-border bg-card p-6 sm:p-9 lg:order-none">
                        <h2 className="mb-2 text-2xl">Send us a message</h2>
                        <p className="mb-7 text-sm text-muted-foreground">Tell us a little about what you need. We’ll take it from there.</p>
                        <ContactForm />
                    </div>
                </div>
            </section>
        </>
    );
}
