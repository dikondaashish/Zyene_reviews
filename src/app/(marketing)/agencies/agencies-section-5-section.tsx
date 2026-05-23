import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AgenciesSection5Section() {
    return (
        <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-3xl text-center">
                    <p className="text-muted-foreground mb-6">
                        Also exploring POS, Zapier, and association partnerships? See the full{" "}
                        <Link href="/partners" className="text-primary underline">partners page</Link>.
                    </p>
                    <Link href="/enterprise">
                        <Button variant="outline">Enterprise for 16+ locations</Button>
                    </Link>
                </div>
            </section>
    );
}
