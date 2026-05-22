"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DemoModeBannerProps {
    className?: string;
}

export function DemoModeBanner({ className = "" }: DemoModeBannerProps) {
    return (
        <div className={`relative group overflow-hidden bg-gradient-to-r from-primary via-chart-1 to-sync-action rounded-2xl p-6 ${className}`}>
            <div
                className="absolute inset-0 bg-[size:20px_20px] opacity-30"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, color-mix(in oklab, var(--primary-foreground) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary-foreground) 10%, transparent) 1px, transparent 1px)",
                }}
            />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-background/10 rounded-full blur-3xl group-hover:bg-background/20 transition-colors duration-700"></div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 text-primary-foreground">
                    <div className="bg-background/20 backdrop-blur-md p-3 rounded-xl border border-background/30">
                        <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold tracking-tight">Experience Zyene in Action</h3>
                            <Badge variant="secondary" className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-none backdrop-blur-sm text-[10px] uppercase tracking-wider py-0 px-2 h-5">
                                Demo Mode
                            </Badge>
                        </div>
                        <p className="text-primary-foreground/85 text-sm max-w-lg leading-relaxed">
                            You&apos;re currently viewing <span className="font-semibold text-primary-foreground">simulated data</span>. Connect your Google Business Profile to unlock real-time reputation management and automated review requests.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <Link href="/settings/integrations">
                        <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-bold border-none px-6 h-12 rounded-xl group/btn">
                            Connect Real Profile
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
