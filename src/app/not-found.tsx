import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { LampContainer } from "@/components/ui/lamp";

export default function NotFound() {
    return (
        <>
            <LampContainer>
                <p
                    className="font-semibold leading-none tracking-tight select-none text-[clamp(5rem,20vw,10rem)] text-cyan-400/20"
                    aria-hidden
                >
                    404
                </p>
                <h1 className="-mt-4 text-4xl font-bold tracking-tight text-slate-100 md:text-5xl">
                    Page not found
                </h1>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-400">
                    The page you&apos;re looking for doesn&apos;t exist or may have
                    moved.
                </p>
                <div className="mt-8">
                    <Link href="/">
                        <Button
                            size="lg"
                            className="rounded-xl bg-cyan-500 px-8 text-base font-semibold text-white hover:bg-cyan-400"
                        >
                            Back to homepage
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                </div>
            </LampContainer>
            <CookieBanner />
        </>
    );
}
