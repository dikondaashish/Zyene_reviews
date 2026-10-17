/**
 * Short hero copy for /industries/[industry]. The kicker keeps each page's search phrase inside the H1;
 * the headline stays under ~7 words and the lede under 20. Long-form copy stays in industry-data.ts.
 */
export interface IndustryHeroCopy {
  kicker: string;
  headline: string;
  lede: string;
}

export const INDUSTRY_HERO_COPY: Record<string, IndustryHeroCopy> = {
  restaurants: {
    kicker: "Review management for restaurants",
    headline: "Full tables. Fresh reviews.",
    lede: "Ask after every visit, reply to Google reviews on autopilot, and give unhappy diners a private way to reach you.",
  },
  dental: {
    kicker: "Review management for dental practices",
    headline: "The practice patients trust first.",
    lede: "Ask after each appointment, approve careful replies, and handle billing or wait-time concerns privately.",
  },
  "auto-repair": {
    kicker: "Review management for auto repair shops",
    headline: "The shop people trust with their car.",
    lede: "Ask after every pickup, keep up with reviews while the bays stay busy, and talk through estimate questions privately.",
  },
  salons: {
    kicker: "Review management for salons and spas",
    headline: "Every great appointment, on the record.",
    lede: "Ask after each visit, reply in your salon's voice, and hear privately when a cut or color misses.",
  },
  "home-services": {
    kicker: "Review management for home services",
    headline: "Win the job before you knock.",
    lede: "Ask when the job closes, reply from the truck, and handle pricing questions privately.",
  },
  medical: {
    kicker: "Review management for medical practices",
    headline: "Steady reviews. Careful replies.",
    lede: "Ask patients after each visit, review AI drafts before they post, and route wait-time concerns to your front desk.",
  },
  hotels: {
    kicker: "Review management for hotels and hospitality",
    headline: "A front desk for your reputation.",
    lede: "Ask at checkout, answer Google reviews in your tone, and hear about room issues while you can still fix them.",
  },
  fitness: {
    kicker: "Review management for gyms and fitness studios",
    headline: "Walk into January with fresh reviews.",
    lede: "Collect reviews all year, reply in your gym's voice, and handle cancellation or billing concerns privately.",
  },
  hvac: {
    kicker: "Review and reputation management for HVAC companies",
    headline: "Be the first call when the AC quits.",
    lede: "Ask when the job closes, reply between calls, and handle quote questions privately.",
  },
  plumbing: {
    kicker: "Review and reputation management for plumbers",
    headline: "The plumber with the freshest reviews.",
    lede: "Turn finished jobs into Google reviews, reply in your shop's voice, and handle billing complaints privately.",
  },
  electricians: {
    kicker: "Review and reputation management for electricians",
    headline: "The electrician homeowners call first.",
    lede: "Ask after every panel, rewire or install, reply from the job site, and resolve concerns privately.",
  },
};

export function getIndustryHeroCopy(slug: string, name: string, fallbackLede: string): IndustryHeroCopy {
  return INDUSTRY_HERO_COPY[slug] ?? { kicker: `Review management for ${name.toLowerCase()}`, headline: name, lede: fallbackLede };
}

/** Directory groups for the /industries hub, in display order. */
export const INDUSTRY_GROUPS: { label: string; text: string; slugs: string[] }[] = [
  { label: "Food and hospitality", text: "Busy rooms, quick visits, guests who read reviews before they book.", slugs: ["restaurants", "hotels"] },
  { label: "Health and care", text: "Careful replies that keep patient details out of public view.", slugs: ["dental", "medical"] },
  { label: "Beauty and fitness", text: "Personal services where every client has an opinion.", slugs: ["salons", "fitness"] },
  { label: "Automotive", text: "Trust before the first call, clarity when the bill arrives.", slugs: ["auto-repair"] },
  { label: "Home services and trades", text: "Crews in the field, homeowners comparing reviews on their phone.", slugs: ["home-services", "hvac", "plumbing", "electricians"] },
];
