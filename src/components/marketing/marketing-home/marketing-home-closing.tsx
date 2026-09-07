import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { HOME_FAQS } from "@/components/marketing/marketing-home/home-faqs";

export function MarketingHomeClosing() {
    return (
        <>
            <section className="marketing-section border-t border-border">
                <div className="marketing-container grid grid-cols-1 gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
                    <div>
                        <h2 className="mb-5 text-4xl">A few things<br />you might be wondering.</h2>
                        <p className="text-muted-foreground">Need a hand choosing?<br /><Link href="/contact" className="font-semibold text-primary underline underline-offset-4">Talk to our team.</Link></p>
                    </div>
                    <div>
                        {HOME_FAQS.map(({ question, answer }) => (
                            <details key={question} className="group border-b border-border first:border-t">
                                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium [&::-webkit-details-marker]:hidden">
                                    {question}<Plus className="size-5 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
                                </summary>
                                <p className="pb-6 pr-8 text-sm leading-7 text-muted-foreground">{answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
            <section className="w-full bg-[var(--brand-wash)] py-16 md:py-20">
                <div className="marketing-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div><h2 className="mb-4 max-w-2xl text-4xl md:text-5xl">Your next great review<br />starts here.</h2><p className="text-muted-foreground">You take care of your customers. We’ll help you stay on top of their feedback.</p></div>
                    <Link href={SIGNUP_URL} className="marketing-button shrink-0">Start your free trial <ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
            </section>
        </>
    );
}
