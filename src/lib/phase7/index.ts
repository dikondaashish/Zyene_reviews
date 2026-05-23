/** @module phase7 — Product-led growth: free tools, upgrade copy, review templates, lead capture. */

export { FREE_TOOLS, getFreeToolBySlug } from "./free-tools-data";
export type { FreeToolDefinition } from "./free-tools-data";

export { getUpgradeModalCopy } from "./upgrade-modal-copy";
export type { UpgradeModalContext } from "./upgrade-modal-copy";

export { generatePrimaryReviewResponse, BONUS_REVIEW_RESPONSE_TEMPLATES, renderBonusTemplates } from "./review-response-templates";

export { captureToolLead } from "./capture-tool-lead";
