import Link from "next/link";
import { ArrowRight, Link2, BarChart3, MessageSquare } from "lucide-react";
import { FREE_TOOLS } from "@/lib/free-tools/free-tools-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

const ICONS = { link: Link2, chart: BarChart3, message: MessageSquare };

const TOOL_NOTES = [
    { icon: Link2, title: "Google Review Link Generator", text: "Looks up your Google Place ID to create a direct URL that opens the Google Maps review box for customers without manual searching." },
    { icon: BarChart3, title: "Reputation Score Checker", text: "Retrieves your current public Google star rating and total review count in a fast diagnostic snapshot." },
    { icon: MessageSquare, title: "Review Response Templates", text: "Provides customizable, rating-specific reply templates to help you structure professional responses to customer reviews." },
] as const;

export default function FreeToolsHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Free Tools", url: "https://www.zyenereviews.com/tools" },
                ]}
            />
            <LandingHero image={{ src: "/marketing/home/cafe-conversation.webp", alt: "A barista talking with a customer at work" }} eyebrow="Free tools for local business" title="A useful next step. On us." description="Create a Google review link, check your reputation, or find the words for your next reply. No signup needed to try." />

            <section className="marketing-section" aria-labelledby="tools-list-heading">
                <div className="marketing-container">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Free tools</p>
                        <h2 id="tools-list-heading">Pick a tool and try it now.</h2>
                    </div>
                    <ul className="mi-cards">
                        {FREE_TOOLS.map((tool) => {
                            const Icon = ICONS[tool.icon];
                            return (
                                <li key={tool.slug} className="flex">
                                    <Link href={`/tools/${tool.slug}`} className="mi-card w-full">
                                        <Icon size={20} aria-hidden="true" />
                                        <h3>{tool.title}</h3>
                                        <p>{tool.description}</p>
                                        <span className="home-text-link">
                                            Use tool <ArrowRight size={14} aria-hidden="true" />
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="tools-about-heading">
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">What each tool does</p>
                        <h2 id="tools-about-heading">Free review tools for local businesses</h2>
                        <p>
                            These free utilities help local businesses handle essential reputation tasks without creating an account: creating a direct Google review link, checking public rating metrics, and drafting professional responses.
                        </p>
                    </div>
                    <div>
                        <ul className="mi-list">
                            {TOOL_NOTES.map(({ icon: Icon, title, text }) => (
                                <li key={title}>
                                    <Icon size={18} aria-hidden="true" />
                                    <div>
                                        <h3>{title}</h3>
                                        <p>{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="mi-table-note">
                            When you are ready to automate review collection after customer visits, monitor incoming feedback across platforms in one inbox, and use AI reply workflows, Zyene Reviews provides connected plans starting at $29.99/mo with a 7-day free trial.
                        </p>
                    </div>
                </div>
            </section>

            <MarketingClosingBand
                title="Want automation behind these tools?"
                text="Zyene Reviews sends review requests, drafts AI replies, automatically replies to eligible new Google reviews, and tracks competitors - from $29.99/mo with a 7-day free trial."
                image={{ src: "/images/industries/dental-candid-v2.webp", alt: "Dental team preparing instruments beside an empty treatment chair" }}
                trackLocation="tools"
                headingId="tools-final-heading"
            />
        </>
    );
}
