import { SUPPORT_CHAT_STARTERS, SUPPORT_CHAT_TEASER } from "@/lib/support-chat/constants";

export interface PageChatContext {
    teaser: string;
    /** Replaces the generic "How can I help?" line. */
    opener: string;
    starters: readonly string[];
}

const COMPETITOR_NAMES: Record<string, string> = {
    birdeye: "Birdeye", podium: "Podium", prosperly: "Prosperly", nicejob: "NiceJob", gatherup: "GatherUp",
};

const titleCase = (slug: string) => slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Greeting and suggested questions tuned to the page the visitor is reading. */
export function getPageChatContext(pathname: string | null | undefined): PageChatContext {
    const path = pathname ?? "/";
    const compare = path.match(/^\/compare\/([\w-]+)/);
    if (compare) {
        const name = COMPETITOR_NAMES[compare[1]] ?? titleCase(compare[1]);
        return {
            teaser: `Switching from ${name}? I can show you the differences.`,
            opener: `Switching from ${name}? I can walk you through what changes and what it costs.`,
            starters: [`How are you different from ${name}?`, "Is it cheaper?", "Can I move my reviews over?", "Book a demo"],
        };
    }
    if (path.startsWith("/pricing")) {
        return {
            teaser: "Comparing plans? I can help you pick the right one.",
            opener: "Comparing plans? Tell me how many locations you have and I'll suggest one.",
            starters: ["Which plan fits me?", "Is there a free trial?", "Starter vs Professional?", "Do you have yearly billing?"],
        };
    }
    const industry = path.match(/^\/industries\/([\w-]+)/);
    if (industry) {
        const name = titleCase(industry[1]);
        return {
            teaser: `Hi! Want to see how ${name.toLowerCase()} get more reviews?`,
            opener: `I can show you how ${name.toLowerCase()} use Zyene to get more 5-star reviews.`,
            starters: ["How do I get more Google reviews?", "Check my rating", "How much does it cost?", "Book a demo"],
        };
    }
    if (path.startsWith("/features/")) {
        return {
            teaser: "Questions about this feature? Ask me anything.",
            opener: "Curious how this feature works day to day? Ask me anything.",
            starters: ["How does this work?", "Which plan includes it?", "Is there a free trial?", "Book a demo"],
        };
    }
    if (path.startsWith("/demo")) {
        return {
            teaser: "Want to book a demo right here in chat?",
            opener: "I can book your demo right here. Want to see open times?",
            starters: ["Book a demo", "What will the demo cover?", "How much does it cost?", "Is there a free trial?"],
        };
    }
    if (path.startsWith("/help") || path.startsWith("/docs")) {
        return {
            teaser: "Stuck on something? I can point you to the right guide.",
            opener: "Tell me what you're trying to do and I'll point you to the right guide.",
            starters: ["How do I connect Google?", "How do I send review requests?", "How do I connect Square?", "Talk to a person"],
        };
    }
    if (path.startsWith("/blog") || path.startsWith("/resources")) {
        return {
            teaser: "Want to put this into practice? I can help.",
            opener: "Want help putting this into practice for your business?",
            starters: ["Check my rating", "How do I get more Google reviews?", "Can AI reply to my reviews?", "How much does it cost?"],
        };
    }
    return { teaser: SUPPORT_CHAT_TEASER, opener: "How can I help?", starters: [...SUPPORT_CHAT_STARTERS.slice(0, 3), "Check my rating"] };
}
