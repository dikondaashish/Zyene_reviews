import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";
import { DemoBookingCalendar } from "@/components/marketing/demo-booking-calendar";
import { FunctionalEmbedGate } from "@/components/privacy/functional-embed-gate";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/enterprise/enterprise-data";

const BOOKING_URL = "https://cal.com/zyenereviews/15min";

export function DemoPanelsSection({ calComEmbedUrl }: { calComEmbedUrl: string | null }) {
    return (
        <section className="marketing-section" aria-label="Book a demo">
            <div className="marketing-container demo-panels">
                <div className="mi-panel">
                    <h2>Pick a time that suits you</h2>
                    <p>
                        Pick a time that works for your team. Typical demo: 15 minutes. We’ll show how to select a business, choose a reply tone and star threshold, and turn on automatic Google replies.
                    </p>
                    <div className="demo-panel-body">
                        {calComEmbedUrl ? (
                            <FunctionalEmbedGate
                                provider="Cal.com"
                                actionLabel="Show available times"
                                fallback={<a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="home-text-link">Or open the booking page <ArrowRight size={14} aria-hidden="true" /></a>}
                            >
                                <DemoBookingCalendar src={calComEmbedUrl} />
                            </FunctionalEmbedGate>
                        ) : (
                            <>
                                <p className="demo-panel-note">Choose a time on our booking page, or send your details and we’ll arrange a demo.</p>
                                <div className="marketing-actions">
                                    <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="marketing-button">
                                        Choose a time <ArrowRight size={16} aria-hidden="true" />
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mi-panel">
                    <h2>Or send us your details</h2>
                    <p>Tell us about your business and we’ll follow up by email within one business day.</p>
                    <div className="demo-panel-body">
                        <DemoRequestForm />
                    </div>
                    <div className="mi-panel-foot">
                        <a href={`mailto:${ENTERPRISE_SALES_EMAIL}?subject=Enterprise%20demo%20request`} className="home-text-link">
                            Email sales directly <ArrowRight size={14} aria-hidden="true" />
                        </a>
                        <Link href="/enterprise" className="home-text-link">
                            Enterprise overview <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
