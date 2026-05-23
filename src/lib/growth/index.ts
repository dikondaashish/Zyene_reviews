/** @module growth — Growth engine: KPIs, page inventory, PLG, referral, and blueprint audit. */

export { PRODUCT_PILLARS, NEGATIVE_FEEDBACK_SHIELD, PLAN_COMPARISON_ROWS, ICP_SEGMENTS, POSITIONING, MARKET_COMPARISON_CAPABILITIES } from "./product-foundation";
export type { ProductPillar } from "./product-foundation";

export { FEATURE_PILLARS, FEATURE_PILLAR_SLUGS, FEATURE_PILLAR_MAP, FEATURE_PILLAR_ALIASES, resolveFeaturePillarSlug } from "./feature-pillars";
export type { FeaturePillarSlug, FeaturePillarPage } from "./feature-pillars";

export { KPI_DEFINITIONS, KPI_BY_ID } from "./kpi-definitions";
export type { KpiCategory, KpiTargetDirection, KpiDefinition } from "./kpi-definitions";

export { fetchGrowthKpiSnapshot } from "./kpi-metrics";
export type { KpiStatus, KpiMetricValue, GrowthKpiSnapshot } from "./kpi-metrics";

export { buildGrowthPageInventory } from "./page-inventory";

export { GROWTH_IMPLEMENTATION_MATRIX } from "./implementation-matrix";

export { buildPlgMarketingUrl, PLG_FOOTER_LABEL, plgSmsFooter, plgEmailFooterHtml, plgEmailFooterPlain } from "./plg-attribution";
export type { PlgRefSource } from "./plg-attribution";

export { buildReferralSignupUrl, REFERRAL_TRIAL_DAYS, DEFAULT_TRIAL_DAYS, isValidReferrerUserId, introTrialDaysForOrganization } from "./referral";

export { processReferralConversionReward } from "./referral-rewards";

export { runGrowthBlueprintAudit, summarizeBlueprintAudit } from "./growth-blueprint-audit";
export type { AuditSeverity, BlueprintAuditItem } from "./growth-blueprint-audit";

export {
    getGrowthDashboardSecret, growthDashboardCookieName,
    createGrowthDashboardToken, verifyGrowthDashboardToken,
    isAuthorizedGrowthDashboardRequest,
} from "./growth-dashboard-auth";

export { useMarketingSignupUrl } from "./marketing-signup-url";

export {
    UTM_COOKIE_NAME, UTM_COOKIE_MAX_AGE_DAYS,
    parseUtmFromSearchParams, hasUtmParams, serializeUtm, deserializeUtm,
    appendUtmToUrl, buildGoogleAdsUtm, buildMetaAdsUtm, isPaidTraffic,
} from "./utm";
export type { UtmParams } from "./utm";

export { scheduleTrialNurture, scheduleOnboardingDrip, scheduleWinbackFollowUp } from "./schedule-growth-emails";
export type { GrowthSequenceKey } from "./schedule-growth-emails";
