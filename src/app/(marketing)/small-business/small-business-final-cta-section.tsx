import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import { NAV_INDUSTRIES } from "@/app/(marketing)/marketing-layout-industry-links";

export function SmallBusinessFinalCtaSection() {
    return (
        <section className="py-16 px-4 bg-primary/5">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to build a steady review routine?</h2>
                <p className="text-muted-foreground mb-6">
                    Start with Starter for one location, or Professional for up to three. Larger groups can look at{" "}
                    <Link href="/enterprise" className="text-primary underline">Enterprise</Link>.
                </p>
                <Button size="lg" asChild>
                    <Link href={SIGNUP_URL} data-track="trial" data-track-location="small-business-final">Start free trial</Link>
                </Button>
                <nav aria-label="Review management by industry" className="mt-10">
                    <p className="text-sm font-medium mb-3">Review management by industry</p>
                    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                        {NAV_INDUSTRIES.map((industry) => (
                            <li key={industry.slug}>
                                <Link href={`/industries/${industry.slug}`} className="text-muted-foreground underline hover:text-foreground">
                                    {industry.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </section>
    );
}
