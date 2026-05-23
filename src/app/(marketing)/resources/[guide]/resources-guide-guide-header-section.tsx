import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/phase4/resource-data";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResourcesGuideGuideHeaderSection({ resource }: { resource: (typeof RESOURCE_MAP)[string] }) {
    return (
        <header className="pt-16 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-4xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium truncate max-w-xs">{resource.title}</span>
                    </nav>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-5">
                        Free Guide
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-[1.1]">
                        {resource.title}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-7 leading-relaxed">
                        {resource.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {resource.readMinutes} min read
                        </div>
                        <span>·</span>
                        <span>Updated {new Date(resource.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    </div>
                </div>
            </header>
    );
}
