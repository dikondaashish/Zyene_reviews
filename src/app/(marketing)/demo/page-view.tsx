import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { AutoRepliesHeroVisual } from "@/components/marketing/feature-landing/visuals/automatic-review-replies-visuals";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getCalComEmbedUrlFromEnv } from "@/lib/enterprise/cal-com-embed";
import { DemoPanelsSection } from "./demo-panels-section";

export default function DemoPage() {
    const calComEmbedUrl = getCalComEmbedUrlFromEnv();
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Book a demo", url: "https://www.zyenereviews.com/demo" },
                ]}
            />

            <LandingHero
                eyebrow="See Zyene in action"
                title="See your review routine in action."
                description="Walk through fair SMS, email, link, and QR-code requests, AI drafts and automatic Google replies, private feedback follow-up, and reporting with our team."
                variant="conversion"
                media={{
                    kind: "product",
                    label: "A new Google review passing the automatic reply checks to a posted reply",
                    node: <div className="mi-visual"><AutoRepliesHeroVisual /></div>,
                }}
            >
                <Link href="/#home-product-tour" className="home-text-link">
                    Try automatic replies in the interactive demo before booking <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </LandingHero>

            <DemoPanelsSection calComEmbedUrl={calComEmbedUrl} />

            <MarketingClosingBand
                title="Prefer to try it yourself first?"
                text="Start a free trial and set up review requests, replies and reporting at your own pace."
                secondary={{ label: "See pricing", href: "/pricing" }}
                image={{ src: "/marketing/home/cafe-service.webp", alt: "A barista serving iced coffee to a customer" }}
                trackLocation="demo-final"
            />
        </>
    );
}
