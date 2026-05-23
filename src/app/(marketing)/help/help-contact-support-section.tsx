import Link from "next/link";
import { ArrowRight, Mail, Search } from "lucide-react";
import type { Metadata } from "next";

export function HelpContactSupportSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="p-10 bg-card rounded-2xl border border-border">
                        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Our support team is available Monday through Friday, 9am–6pm EST.
                            We typically respond within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="mailto:support@zyenereviews.com"
                                className="inline-flex items-center justify-center bg-primary text-primary-foreground border border-primary px-6 py-3 rounded-md font-medium hover:brightness-95 transition"
                            >
                                <Mail className="w-5 h-5 mr-2" />
                                Email Support
                            </a>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center bg-background border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-accent transition"
                            >
                                View all contact options
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
    );
}
