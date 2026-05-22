import type { Metadata } from "next";
import { Mail, Clock, MessageSquare, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Reach out to the Zyene Reviews team for support, sales, or general inquiries. We typically respond within 24 hours, Monday through Friday.",
    alternates: { canonical: "https://zyenereviews.com/contact" },
    openGraph: {
        title: "Contact Zyene Reviews",
        description:
            "Get in touch with our support team or talk to sales about Enterprise plans. We typically respond within 24 hours.",
        url: "https://zyenereviews.com/contact",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Zyene Reviews",
        description:
            "Reach us at support@zyenereviews.com. Mon–Fri, 9am–6pm EST. We typically respond within 24 hours.",
    },
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background py-24 text-foreground">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
                <div className="bg-card p-8 md:p-16 rounded-lg border border-border">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                        Have a question, need help, or want to learn more about Zyene Reviews?
                        We&apos;re here for you.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-muted rounded-lg p-6 border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-md border border-primary/20 flex items-center justify-center">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-foreground">Email Support</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                For general inquiries, technical support, or account questions.
                            </p>
                            <a
                                href="mailto:support@zyenereviews.com"
                                className="text-primary hover:brightness-90 font-medium text-sm"
                            >
                                support@zyenereviews.com
                            </a>
                        </div>

                        <div className="bg-muted rounded-lg p-6 border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-md border border-primary/20 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-foreground">Business Hours</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                Monday – Friday: 9:00 AM – 6:00 PM EST
                            </p>
                            <p className="text-sm text-muted-foreground">
                                We typically respond within 24 hours.
                            </p>
                        </div>

                        <div className="bg-muted rounded-lg p-6 border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-md border border-primary/20 flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-foreground">Enterprise Sales</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Need custom integrations, unlimited locations, or a dedicated account manager?
                            </p>
                            <a
                                href="mailto:sales@zyenereviews.com?subject=Enterprise%20Inquiry"
                                className="text-primary hover:brightness-90 font-medium text-sm"
                            >
                                sales@zyenereviews.com
                            </a>
                            <p className="text-sm text-muted-foreground mt-3">
                                <Link href="/demo" className="text-primary hover:underline">Book a demo</Link>
                                {" · "}
                                <Link href="/enterprise" className="text-primary hover:underline">Enterprise overview</Link>
                            </p>
                        </div>

                        <div className="bg-muted rounded-lg p-6 border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-md border border-primary/20 flex items-center justify-center">
                                    <HelpCircle className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-foreground">Help Center</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Browse our knowledge base for guides, tutorials, and FAQs.
                            </p>
                            <Link href="/help" className="text-primary hover:brightness-90 font-medium text-sm">
                                Visit Help Center →
                            </Link>
                        </div>
                    </div>

                    <div className="text-center border-t border-border pt-8">
                        <h2 className="text-xl font-semibold text-foreground mb-3">
                            Ready to get started?
                        </h2>
                        <p className="text-muted-foreground mb-6 text-sm">
                            Try Zyene Reviews free for 7 days. Cancel before the trial ends — no charge.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                                <Button className="rounded-md px-8 py-6 font-medium">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link
                                href="/#pricing"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                View pricing →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
