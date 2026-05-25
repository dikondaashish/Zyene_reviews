/**
 * JSON-LD Structured Data Components
 *
 * Each component renders a <script type="application/ld+json"> tag that Google
 * and other search engines use for rich results, sitelinks, knowledge panels, etc.
 *
 * Usage: import and place directly in server component page.tsx or layout.tsx.
 * Do NOT wrap in "use client" — these must be server-rendered.
 */

export type { FaqItem, BreadcrumbItem } from "./json-ld-types";
export { OrganizationJsonLd } from "./json-ld-organization";
export { WebSiteJsonLd } from "./json-ld-website";
export { SoftwareApplicationJsonLd } from "./json-ld-software-application";
export { FAQPageJsonLd } from "./json-ld-faq-page";
export { BreadcrumbJsonLd } from "./json-ld-breadcrumb";
export { ProductJsonLd } from "./json-ld-product";
export { ArticleJsonLd } from "./json-ld-article";
export { WebPageJsonLd } from "./json-ld-web-page";
export { IndustryLocalBusinessJsonLd } from "./json-ld-industry-local-business";
export { PricingPlansJsonLd } from "./json-ld-pricing-plans";
export { HowToJsonLd } from "./json-ld-howto";
export type { HowToStep } from "./json-ld-howto";
