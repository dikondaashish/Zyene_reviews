import Link from "next/link";
import { Building2, Plus, MessageSquare, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessesEmptyState() {
    return (
        <section className="flex flex-col items-center rounded-xl border border-border/70 bg-card px-6 py-14 text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5">
                <Building2 className="size-6 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Your first location starts here</h2>
            <p className="mb-6 mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Add a business, connect your review platforms, and give every customer conversation a home.
            </p>
            <Button asChild className="rounded-lg"><Link href="/businesses/add"><Plus className="size-4" />Add your first business</Link></Button>
            <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Plug className="size-3.5" />Connect review platforms</span>
                <span className="flex items-center gap-1.5"><MessageSquare className="size-3.5" />Manage reviews in one place</span>
            </div>
        </section>
    );
}
