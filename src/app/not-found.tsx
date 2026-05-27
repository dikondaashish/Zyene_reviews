import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayoutHeader } from "@/app/(marketing)/marketing-layout-header";
import { MarketingLayoutFooter } from "@/app/(marketing)/marketing-layout-footer";
import { CookieBanner } from "@/components/ui/cookie-banner";

export default function NotFound() {
    return (
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-foreground">
            <MarketingLayoutHeader />
            <main className="min-w-0 flex-1">
                <section className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-24 text-center sm:px-8">
                    <div className="container mx-auto max-w-2xl">
                        <p
                            className="font-display text-[clamp(6rem,22vw,11rem)] font-semibold leading-none tracking-tight text-primary/20 select-none"
                            aria-hidden
                        >
                            404
                        </p>
                        <h1 className="-mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Page not found
                        </h1>
                        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground leading-relaxed">
                            The page you&apos;re looking for doesn&apos;t exist or may have moved.
                        </p>
                        <div className="mt-10">
                            <Link href="/">
                                <Button
                                    size="lg"
                                    className="rounded-xl px-8 py-6 text-base font-semibold"
                                >
                                    Back to homepage
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <CookieBanner />
            <MarketingLayoutFooter />
        </div>
    );
}
