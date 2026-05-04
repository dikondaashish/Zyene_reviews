export type SparseTemplateTone = "professional" | "friendly" | "concise";

/** Single-word trades / roles that read awkwardly in “as a {X}…” style lines. */
const CATEGORY_BLOCKLIST = new Set(
    [
        "plumber",
        "electrician",
        "hvac",
        "locksmith",
        "roofer",
        "painter",
        "carpenter",
        "contractor",
        "handyman",
        "technician",
        "cleaner",
        "driver",
        "mechanic",
    ].map((s) => s.toLowerCase())
);

export function humanizeCategory(raw: string): string | null {
    const t = raw.trim().replace(/_/g, " ");
    if (!t) return null;
    const lower = t.toLowerCase();
    if (lower === "local" || lower === "business" || lower === "other") return null;
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export function ratingWords(rating: number): string {
    if (rating >= 5) return "your 5-star rating";
    if (rating >= 4) return "your 4-star rating";
    return "your rating";
}

function djb2(seed: string): number {
    let h = 5381;
    for (let i = 0; i < seed.length; i++) {
        h = (h * 33) ^ seed.charCodeAt(i);
    }
    return Math.abs(h);
}

/**
 * Optional clause when category is present and not blocklisted. Phrased to avoid “As a Plumber…” awkwardness.
 */
export function pickCategoryFragment(categoryLabel: string | null, seed: string): string {
    if (!categoryLabel) return "";
    const key = categoryLabel.trim().toLowerCase().replace(/\s+/g, " ");
    const firstWord = key.split(" ")[0] ?? "";
    if (CATEGORY_BLOCKLIST.has(firstWord) || CATEGORY_BLOCKLIST.has(key)) return "";

    const c = categoryLabel.trim();
    const variants = [
        ` ${c} is core to what we do — thanks for noticing us on Google.`,
        ` We love serving neighbors through our ${c.toLowerCase()} work — guests like you keep us motivated.`,
        ` Your rating helps more locals discover our ${c.toLowerCase()} — we’re grateful.`,
        ` Proud to be part of the local ${c.toLowerCase()} community; thanks for taking a moment on Google.`,
        ` Quality ${c.toLowerCase()} is our focus, and feedback like yours keeps us sharp.`,
    ];
    return variants[djb2(seed + "|cat") % variants.length] ?? "";
}

/** Placeholders: {name}, {rw}, {cat} (category clause, may be empty). */
export const SPARSE_REPLY_TEMPLATES: Record<SparseTemplateTone, readonly string[]> = {
    concise: [
        "Thanks for {rw} for {name} on Google.{cat} Hope to see you again soon.",
        "{name} appreciates {rw} — thank you.{cat} Come back anytime.",
        "Grateful for {rw} on Google for {name}.{cat} It really helps.",
        "Thank you: {rw} for {name} logged on Google.{cat} We’ll be ready for your next visit.",
        "{rw} means a lot to {name}.{cat} Thanks for the boost.",
        "Noted with thanks — {rw} for {name} on Google.{cat} See you soon.",
        "Thank you for {rw} at {name}.{cat} We appreciate you.",
        "Quick thanks for {rw} on Google — {name} is cheering.{cat}",
        "{rw} for {name} on Google — received with thanks.{cat}",
        "Hello, and thank you for {rw} today for {name}.{cat}",
        "We logged {rw} for {name}; thank you.{cat}",
        "{rw} on Google for {name} — thank you.{cat} See you next time.",
        "Thanks — {rw} for {name} noted.{cat} Appreciate you.",
        "{name}: {rw} received. Thank you.{cat}",
        "Your {rw} for {name} on Google — thanks.{cat} Means a lot.",
        "Thank you for {rw} for {name}.{cat} Short and sweet — we noticed.",
        "{rw} for {name} — got it, thanks.{cat} Hope to host you again.",
        "Thanks for {rw} on Google for {name}.{cat} You’re awesome.",
        "{name} says thanks for {rw}.{cat} Come back soon.",
        "Received {rw} for {name} on Google — thank you.{cat}",
    ],
    friendly: [
        "Hi! Thank you for {rw} for {name} on Google.{cat} You made our whole team smile — can’t wait to have you back.",
        "Hey there — thanks for {rw} for {name}!{cat} That kind of support keeps us going.",
        "So grateful for {rw} for {name} on Google.{cat} Thanks for rooting for us.",
        "Thank you for cheering on {name} with {rw} on Google.{cat} It means more than you know.",
        "Big thanks for {rw} for {name}!{cat} We’re doing a little happy dance over here.",
        "We saw {rw} for {name} on Google — thank you!{cat} Hope we get to wow you again soon.",
        "Warm thanks for {rw} for {name}.{cat} Community love like yours is the best part of the job.",
        "You just made our day with {rw} for {name} on Google.{cat} Thank you, truly.",
        "From our crew to you: thanks for {rw} for {name}!{cat} Come back when you’re in the mood for more.",
        "Thank you for choosing {name} and for {rw} on Google.{cat} Grateful doesn’t quite cover it.",
        "A quick note of thanks from {name} for {rw} on Google.{cat} You’re wonderful.",
        "Hello friend — {rw} for {name} on Google stopped us mid-shift to say thanks.{cat}",
        "We’re beaming over {rw} for {name}.{cat} Thanks for spreading the good vibes.",
        "Your {rw} for {name} on Google feels like a high-five.{cat} Right back at you.",
        "Thanks a million for {rw} for {name}!{cat} The whole place is buzzing.",
        "Couldn’t let {rw} for {name} on Google pass without saying thank you.{cat} You’re the best.",
        "Honored by {rw} for {name}.{cat} Thanks for believing in what we do.",
        "You + {rw} for {name} on Google = instant joy here.{cat} Come see us again.",
        "Huge thank you for {rw} for {name}!{cat} You’re officially part of the {name} fan club.",
        "Smiling ear to ear over {rw} for {name} on Google.{cat} Thanks for the love.",
    ],
    professional: [
        "Thank you for {rw} for {name} on Google.{cat} We appreciate your support and look forward to serving you again.",
        "{name} thanks you for {rw} on Google.{cat} Feedback like this helps us continue to improve.",
        "We’re grateful for {rw} for {name} on Google.{cat} Thank you for choosing us.",
        "Thank you for taking a moment to leave {rw} for {name} on Google.{cat} It is valued by our entire team.",
        "Your {rw} for {name} on Google is appreciated.{cat} We hope to welcome you back soon.",
        "Thank you for supporting {name} with {rw} on Google.{cat} We do not take that for granted.",
        "{name} acknowledges {rw} on Google with thanks.{cat} We remain at your service.",
        "We note {rw} for {name} on Google and thank you for it.{cat} We look forward to your next visit.",
        "Thank you for {rw} for {name}.{cat} It reinforces why we focus on consistent, thoughtful service.",
        "Sincere thanks for {rw} for {name} on Google.{cat} Please visit us again when it suits you.",
        "On behalf of {name}, thank you for {rw} on Google.{cat} We will strive to earn that trust on every visit.",
        "Thank you — {rw} for {name} on Google has been noted by our team.{cat}",
        "Thanks for recognizing {name} with {rw} on Google.{cat} Your support shapes what we do next.",
        "We appreciate {rw} for {name} on Google.{cat} Thank you for helping others find us.",
        "Thank you for {rw} logged for {name} on Google.{cat} We value your time and your rating.",
        "{name} is pleased to receive {rw} on Google.{cat} Thank you for your confidence.",
        "Your {rw} for {name} contributes to how we show up online.{cat} With thanks.",
        "Thank you for the strong signal of support — {rw} for {name} on Google.{cat}",
        "We recognize {rw} for {name} on Google and thank you sincerely.{cat}",
        "Thank you for {rw} for {name}.{cat} We aim to deliver an experience worth that rating every time.",
    ],
};

export function sparsePoolForTone(tone: SparseTemplateTone): string[] {
    const pool = SPARSE_REPLY_TEMPLATES[tone];
    return pool ? [...pool] : [...SPARSE_REPLY_TEMPLATES.professional];
}

export function renderSparseTemplate(
    template: string,
    ctx: { name: string; rw: string; categoryFragment: string }
): string {
    return template
        .replace(/\{name\}/g, ctx.name)
        .replace(/\{rw\}/g, ctx.rw)
        .replace(/\{cat\}/g, ctx.categoryFragment)
        .replace(/\s+/g, " ")
        .replace(/\.\s+\./g, ".")
        .trim();
}
