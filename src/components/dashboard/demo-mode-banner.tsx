import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DemoModeBanner({ className = "" }: { className?: string }) {
    return (
        <aside className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`} aria-label="Demo workspace">
            <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Sparkles className="size-5" aria-hidden />
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold tracking-tight">Explore your workspace</h3>
                            <Badge variant="secondary">Demo</Badge>
                        </div>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                            You&apos;re viewing sample data. Connect your Google Business Profile to manage your reviews and send review requests.
                        </p>
                    </div>
                </div>
                <Button asChild className="h-11 shrink-0 rounded-lg px-5">
                    <Link href="/settings/integrations">Connect your profile <ArrowRight className="size-4" aria-hidden /></Link>
                </Button>
            </div>
        </aside>
    );
}
