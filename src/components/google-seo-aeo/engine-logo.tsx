"use client";

import Image from "next/image";
import { Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";

/** The site each engine's favicon comes from; Google's three surfaces share Google's mark. */
const ENGINE_DOMAIN: Record<AnswerEngineId, string> = {
    google_serp: "google.com",
    google_ai_overview: "google.com",
    google_ai_mode: "google.com",
    chatgpt: "chatgpt.com",
    perplexity: "perplexity.ai",
    gemini: "gemini.google.com",
    claude: "claude.ai",
    copilot: "copilot.microsoft.com",
};

export function engineLogoUrl(id: string): string | null {
    const domain = ENGINE_DOMAIN[id as AnswerEngineId];
    return domain ? getBrandLogoUrl(domain) : null;
}

/** Decorative: the engine's name is always printed next to it. */
export function EngineLogo({ engineId, className = "size-4" }: { engineId: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    const src = engineLogoUrl(engineId);
    if (!src || failed) return <Bot className={cn(className, "shrink-0 text-muted-foreground")} aria-hidden />;
    return (
        <Image
            src={src}
            alt=""
            width={16}
            height={16}
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className={cn(className, "shrink-0 rounded-sm object-contain")}
        />
    );
}
