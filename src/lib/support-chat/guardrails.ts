/**
 * Cheap, deterministic checks that run before and after the model. The system
 * prompt does most of the work; these catch the obvious attacks without spending
 * a model call, and stop a leaked prompt or off-site link from reaching the page.
 */

/** Planted in the system prompt; if it ever appears in a reply, the prompt leaked. */
export const SYSTEM_PROMPT_CANARY = "ZR-CANARY-7f3c9a";

const INJECTION_PATTERNS: RegExp[] = [
    /\b(ignore|disregard|forget|override|bypass)\b[^.?!]{0,40}\b(previous|prior|above|earlier|all|your|the)\b[^.?!]{0,20}\b(instructions?|rules?|prompts?|guidelines?|directions?)\b/i,
    /\b(system|developer|hidden|initial|original)\s+(prompt|message|instructions?)\b/i,
    /\b(reveal|show|print|repeat|output|leak|tell me)\b[^.?!]{0,30}\b(your|the)\s+(instructions?|prompt|rules|configuration|guidelines)\b/i,
    /\b(jailbreak|DAN mode|developer mode|god mode|unfiltered mode|no restrictions)\b/i,
    /\byou are (now|no longer)\b/i,
    /\b(pretend|act|roleplay|role-play)\b[^.?!]{0,20}\b(you are|to be|as)\b[^.?!]{0,30}\b(unrestricted|without (any )?(rules|limits|filters)|another (ai|assistant|model)|chatgpt|evil)\b/i,
    /\[\s*(system|assistant|inst)\s*\]|<\s*\/?\s*(system|assistant|instructions?)\s*>|<\|im_start\|>/i,
    /\bnew (instructions|rules|persona)\s*:/i,
];

export function looksLikePromptInjection(text: string): boolean {
    const normalized = text.normalize("NFKC").replace(/[​-‍﻿]/g, "");
    return INJECTION_PATTERNS.some((pattern) => pattern.test(normalized));
}

const ALLOWED_LINK_HOSTS = new Set(["zyenereviews.com", "www.zyenereviews.com", "collectratings.com"]);

function isAllowedHref(href: string): boolean {
    if (/^\/(?!\/)[\w\-/#?=&.%]*$/.test(href)) return true;
    if (/^mailto:(contact|support|sales)@zyenereviews\.com$/i.test(href)) return true;
    try {
        const url = new URL(href);
        return url.protocol === "https:" && ALLOWED_LINK_HOSTS.has(url.hostname);
    } catch {
        return false;
    }
}

/** Keeps only first-party links; anything else collapses to its label text. */
export function stripForeignLinks(text: string): string {
    return text
        .replace(/\[([^\]]{1,80})\]\(([^)\s]{1,300})\)/g, (match, label: string, href: string) =>
            isAllowedHref(href) ? match : label)
        .replace(/\bhttps?:\/\/[^\s)]+/g, (url) => (isAllowedHref(url) ? url : "[link removed]"));
}

export const REFUSAL_INJECTION =
    "I can only help with questions about Zyene Reviews, so I can't change how I work. Ask me anything about collecting reviews, AI replies, pricing or getting started.";

export const REFUSAL_OFF_TOPIC =
    "I'm here to help with Zyene Reviews only, so I can't answer that one. I'm happy to explain how we help local businesses get more reviews, reply with AI, or pick the right plan.";

export const REPLY_UNAVAILABLE =
    "Sorry, I couldn't answer that just now. You can try again in a moment, or email contact@zyenereviews.com and the team will help.";

/** Final pass on model output before it is shown to a visitor. */
export function sanitizeReply(raw: string): string | null {
    const text = raw.replace(/\r\n/g, "\n").trim();
    if (!text || text.includes(SYSTEM_PROMPT_CANARY)) return null;
    // HTML or script never belongs in a chat bubble; the widget renders plain text.
    const withoutTags = text.replace(/<[^>]{1,200}>/g, "");
    return stripForeignLinks(withoutTags).slice(0, 1_800).trim() || null;
}
