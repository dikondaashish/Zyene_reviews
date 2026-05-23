import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
                <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md ring-1 ring-border/60">
                    <Image
                        src="/Main%20logo.png"
                        alt="Zyene Reviews"
                        width={40}
                        height={40}
                        className="size-full object-cover"
                    />
                </div>
                <span className="text-lg font-bold text-foreground">
                    <span className="text-primary">Zyene</span> Reviews
                </span>
            </Link>

            <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Page not found
            </h1>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or may have moved. Head back to the
                homepage to explore Zyene Reviews.
            </p>

            <Link href="/" className="mt-8">
                <Button size="lg" className="gap-2 rounded-xl px-8">
                    <Home className="size-4" />
                    Back to homepage
                </Button>
            </Link>
        </div>
    );
}
