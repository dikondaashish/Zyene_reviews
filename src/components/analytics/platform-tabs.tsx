"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Globe, Facebook, LayoutGrid, Chrome } from "lucide-react";
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
            icon: <Chrome className="text-brand-google size-4" />,
            color: "text-primary"
        },
        { 
            id: "facebook", 
            name: "Facebook", 
            icon: <Facebook className="text-brand-facebook size-4" />,
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
            <div className="flex items-center gap-2 p-1 bg-muted/40 backdrop-blur-md border border-border/50 rounded-2xl w-fit overflow-x-auto no-scrollbar">
                {availablePlatforms.map((platform) => {
                    const isActive = activePlatform === platform.id;
                    return (
                        <button
                            key={platform.id}
                            onClick={() => handlePlatformChange(platform.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-platform"
                                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className={cn("transition-colors duration-300", platform.color)}>
                                {platform.icon}
                            </span>
                            {platform.name}
                        </button>
                    );
                })}
            </div>
            
            {activePlatform === "zyene" && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl w-fit"
                >
                    <span className="text-xs text-primary font-medium">Internal Link:</span>
                    <a 
                        href={`https://collectratings.com/${businessSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary/80 hover:underline flex items-center gap-1"
                    >
                        collectratings.com/{businessSlug}
                        <Globe className="ml-1 size-3" />
                    </a>
                </motion.div>
            )}
        </div>
    );
}
