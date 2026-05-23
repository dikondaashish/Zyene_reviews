/** @module phase6 — Paid acquisition & partnerships: email sequences, newsletter, ads, partnerships. */

export { TRIAL_NURTURE_STEPS, ONBOARDING_DRIP_STEPS } from "./email-sequences-data";
export type { GrowthEmailStep } from "./email-sequences-data";

export { PARTNERSHIP_CHANNELS, AGENCY_PARTNER_PERKS, PARTNER_CONTACT_EMAIL } from "./partnerships-data";
export type { PartnershipChannel } from "./partnerships-data";

export { MONTHLY_NEWSLETTER_EDITIONS, getMonthlyNewsletterEdition } from "./monthly-newsletter-content";
export type { MonthlyNewsletterEdition } from "./monthly-newsletter-content";

export { GOOGLE_ADS_CAMPAIGNS, getGoogleAdsBanner } from "./google-ads-data";
export type { GoogleAdsCampaignType, GoogleAdsCampaign } from "./google-ads-data";

export { META_ADS_CAMPAIGNS, getMetaAdsBanner } from "./meta-ads-data";
export type { MetaAudienceType, MetaAdsCampaign } from "./meta-ads-data";
