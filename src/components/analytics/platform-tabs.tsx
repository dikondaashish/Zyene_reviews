"use client";

import { ReviewCardGoogleIcon } from "@/components/reviews/review-card-google-icon";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";
import { cn } from "@/lib/utils";
import { Globe, LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Platform {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
}

interface PlatformTabsProps {
    platforms: string[]; // ['google', 'facebook', etc]
    activePlatform: string;
    businessSlug: string;
    /** When set, platform switching is client-only (no Next.js navigation). */
    onPlatformChange?: (platformId: string) => void;
}

export function PlatformTabs({ platforms, activePlatform, businessSlug, onPlatformChange }: PlatformTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const allPlatforms: Platform[] = [
        { 
            id: "all", 
            name: "All Platforms", 
            icon: <LayoutGrid className="size-4" />,
            color: "text-primary"
        },
        { 
            id: "zyene", 
            name: "Own Platform", 
            icon: <Globe className="size-4" />,
            color: "text-primary"
        },
        { 
            id: "google", 
            name: "Google", 
            icon: <ReviewCardGoogleIcon className="size-4" />,
            color: "text-primary"
        },
        { 
            id: "facebook", 
            name: "Facebook", 
            icon: <FacebookBrandIcon aria-hidden="true" className="size-4" />,
            color: "text-primary"
        },
    ];

    const availablePlatforms = allPlatforms.filter(p => 
        p.id === "all" || p.id === "zyene" || platforms.includes(p.id)
    );

    const handlePlatformChange = (id: string) => {
        if (onPlatformChange) {
            onPlatformChange(id);
            return;
        }
        const params = new URLSearchParams(searchParams.toString());
        if (id === "all") {
            params.delete("platform");
        } else {
            params.set("platform", id);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col gap-4">
            <div role="group" aria-label="Analytics platform" className="flex max-w-full flex-wrap items-center gap-1 p-1 bg-muted/40 border border-border rounded-2xl w-fit">
                {availablePlatforms.map((platform) => {
                    const isActive = activePlatform === platform.id;
                    return (
                        <button
                            key={platform.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => handlePlatformChange(platform.id)}
                            className={cn(
                                "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                                isActive
                                    ? "bg-card text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                        >
                            <span className={cn("transition-colors duration-300", platform.color)}>
                                {platform.icon}
                            </span>
                            {platform.name}
                        </button>
                    );
                })}
            </div>
            
            {activePlatform === "zyene" && (
                <div
                    className="flex max-w-full flex-wrap items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl w-fit"
                >
                    <span className="text-xs text-primary font-medium">Your review link:</span>
                    <a 
                        href={`https://collectratings.com/${businessSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex min-w-0 items-center gap-1 break-all"
                    >
                        collectratings.com/{businessSlug}
                        <Globe className="ml-1 size-3" />
                    </a>
                </div>
            )}
        </div>
    );
}
