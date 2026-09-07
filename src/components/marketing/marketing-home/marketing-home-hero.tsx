import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

export function MarketingHomeHero() {
    return (
        <section className="marketing-home-hero w-full">
            <div className="marketing-container marketing-home-hero-layout">
                <div>
                    <p className="marketing-eyebrow">Review management, with a personal touch.</p>
                    <h1>Your reputation.<br /><span>Your next customer.</span></h1>
                    <p className="landing-hero-description">
                        Get more reviews, reply with confidence, and turn customer feedback into your next reason to grow.
                    </p>
                    <div className="marketing-actions">
                        <Link href={SIGNUP_URL} className="marketing-button">Start your free trial <ArrowRight className="size-4" aria-hidden="true" /></Link>
                        <Link href="/demo" className="marketing-button marketing-button-secondary">Book a demo</Link>
                    </div>
                    <p className="marketing-home-note"><Check className="size-4 shrink-0" aria-hidden="true" />7 days free · From $29.99/mo · Cancel anytime</p>
                </div>
                <div className="marketing-home-photo">
                    <Image src="/marketing/home/local-owner-v2.webp" alt="A neighborhood café owner checking customer feedback during her workday" fill priority sizes="(max-width: 767px) 100vw, 48vw" />
                </div>
            </div>
        </section>
    );
}
