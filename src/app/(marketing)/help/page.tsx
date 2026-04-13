import Link from "next/link";
import { ArrowRight, Mail, FileText, Phone } from "lucide-react";

export const metadata = {
    title: "Help Center - Zyene Reviews",
    description: "Support and Help Center for Zyene Reviews users.",
};

export default function HelpCenterPage() {
    const categories = [
        {
            title: "Getting Started",
            description: "Learn how to connect your first review platform and send your first request.",
            icon: FileText,
            href: "/help/getting-started"
        },
        {
            title: "Dashboard & Analytics",
            description: "Understand your review metrics and how to track competitor performance.",
            icon: FileText,
            href: "/help/analytics"
        },
        {
            title: "Automated Campaigns",
            description: "Set up SMS and Email campaigns to automatically request reviews.",
            icon: FileText,
            href: "/help/campaigns"
        },
        {
            title: "Account & Billing",
            description: "Manage your subscription, organization members, and notification settings.",
            icon: FileText,
            href: "/help/billing"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header section */}
            <section className="bg-muted border-b border-border py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you today?</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Search our knowledge base or browse categories below to find answers to your questions.
                    </p>
                    <div className="max-w-xl mx-auto flex items-center bg-background rounded-lg border border-border px-4 py-2">
                        <input
                            type="text"
                            placeholder="Search for articles, guides..."
                            className="flex-1 bg-transparent border-none focus:outline-none px-2 py-2 text-foreground placeholder:text-muted-foreground"
                        />
                        <button className="bg-primary text-primary-foreground border border-primary rounded-md px-6 py-2 font-medium hover:brightness-95 transition">
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 bg-background">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold mb-8">Browse Categories</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {categories.map((category) => (
                            <Link
                                href="#"
                                key={category.title}
                            className="group flex p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-all items-start"
                            >
                                <div className="p-3 bg-primary/10 text-primary rounded-md border border-primary/20 mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <category.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{category.title}</h3>
                                    <p className="text-muted-foreground mb-4">{category.description}</p>
                                    <span className="text-primary text-sm font-medium flex items-center">
                                        View Articles <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-20 bg-muted border-t border-border">
                <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
                    <div className="p-10 bg-card rounded-lg border border-border">
                        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Our support team is available Monday through Friday, 9am to 6pm EST. We typically respond within 2 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a href="mailto:support@zyenereviews.com" className="inline-flex items-center justify-center bg-primary text-primary-foreground border border-primary px-6 py-3 rounded-md font-medium hover:brightness-95 transition">
                                <Mail className="w-5 h-5 mr-2" />
                                Email Support
                            </a>
                            <a href="#" className="inline-flex items-center justify-center bg-background border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-accent transition">
                                <Phone className="w-5 h-5 mr-2" />
                                Call Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
