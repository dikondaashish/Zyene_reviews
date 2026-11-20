import type { BlogPostSource } from "@/lib/content/blog-types";
import { SIGNUP_URL } from "@/config/env";

export const howToFixSuspendedGoogleBusinessProfilePost: BlogPostSource = {
    slug: "how-to-fix-suspended-google-business-profile",
    title: "How to Fix a Suspended Google Business Profile (2026 Guide)",
    excerpt:
        "Diagnose, fix, and appeal a suspended Google Business Profile in 2026. Learn soft vs hard suspension causes, required evidence, and reinstatement steps.",
    pillar: "local-seo",
    pillarLabel: "Local SEO",
    publishedAt: "2026-11-20",
    dateModified: "2026-11-20",
    author: { name: "Chloe Bennett", role: "Local Search Compliance & GBP Reinstatement Specialist" },
    metaTitle: "How to Fix a Suspended Google Business Profile (2026 Guide)",
    metaDescription:
        "Fix a suspended Google Business Profile in 2026. Discover soft vs hard suspension causes, required proof, and the step-by-step reinstatement appeal process.",
    keywords: [
        "google business profile suspension",
        "suspended google business profile",
        "how to fix suspended google business profile",
        "google business profile reinstatement appeal",
        "soft suspension vs hard suspension gbp",
        "google business profile appeals tool",
        "reinstatement evidence utility bill business license",
        "google business profile video verification",
    ],
    relatedSlugs: [
        "google-business-profile-optimization-checklist",
        "how-reviews-impact-local-map-pack-ranking",
        "ranking-higher-on-google-maps-local-seo-playbook",
    ],
    internalLinks: [
        { label: "Complete Google Business Profile Checklist", href: "/blog/google-business-profile-optimization-checklist" },
        { label: "Local SEO Audit Checklist", href: "/resources/local-seo-checklist" },
        { label: "Ranking Higher on Google Maps Playbook", href: "/blog/ranking-higher-on-google-maps-local-seo-playbook" },
        { label: "Free Google Review Link Generator", href: "/tools/review-link-generator" },
    ],
    faqs: [
        {
            question: "Why was my Google Business Profile suspended without warning?",
            answer: "Google's automated spam filters trigger suspensions when detecting high-risk edits (changing address or business name), keyword stuffing, forwarding phone numbers, using co-working spaces or virtual offices, or experiencing sudden irregular activity.",
        },
        {
            question: "What is the difference between a soft suspension and a hard suspension?",
            answer: "In a soft suspension, your listing remains live on Google Maps but marked unverified, disabling dashboard management. In a hard suspension, your listing is completely removed from Google Search and Maps, and prospective customers cannot find your reviews or contact details.",
        },
        {
            question: "How long does Google take to review a reinstatement appeal in 2026?",
            answer: "Google typically reviews standard reinstatement appeals within 3 to 7 business days through the Google Business Profile Appeals Tool. Complex cases requiring secondary manual review or additional documentation can take up to 14 days.",
        },
        {
            question: "Will I lose my existing Google reviews after my profile is reinstated?",
            answer: "No. Once your reinstatement appeal is approved, your historical reviews, star rating, photos, and review replies are fully restored. If reviews do not reappear within 48 hours of reinstatement, contact Google Support with your Profile ID to re-sync them.",
        },
        {
            question: "What documents does Google require for business verification?",
            answer: "Google requires an official government business registration or tax certificate matching your exact legal business name, a current utility bill (water, gas, electricity, or telecom) matching your registered address, and exterior storefront photos showing permanent signage.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "Direct Answer: To fix a suspended Google Business Profile in 2026, never submit an appeal immediately. First, audit and align your listing details (business name, physical address, phone, category) to strictly match your official legal documents. Next, assemble proof: government business registration, a utility bill matching your address, and storefront photos with permanent signage. Finally, submit your appeal through Google's official Business Profile Appeals Tool.",
        },
        {
            type: "p",
            text: "Waking up to a 'Suspended' badge on your Google Business Profile is a terrifying shock for any local business owner. Overnight, your primary source of inbound calls, customer directions, and five-star reviews vanishes from Google Maps. While the instinct is to panic and repeatedly click the appeal button, hasty submissions without correcting underlying policy violations guarantee rejection.",
        },
        {
            type: "h2",
            text: "1. Diagnosing Your Suspension: Soft vs. Hard Suspension",
        },
        {
            type: "table",
            table: {
                headers: ["Suspension Type", "Public Map Visibility", "Dashboard Status", "Primary Remedy"],
                rows: [
                    ["Soft Suspension", "Listing visible on Maps, marked 'Unverified'", "Owner permissions revoked or read-only", "Re-verification via mail, phone, or live video"],
                    ["Hard Suspension", "Listing completely removed from Search & Maps", "'Suspended for deceptive content or policy violation'", "Formal appeal via Google Appeals Tool with legal proof"],
                ],
            },
        },
        {
            type: "image",
            image: {
                src: "/images/blog/google_business_profile_suspended_dashboard.jpg",
                alt: "Business owner viewing a suspended Google Business Profile dashboard with red policy alert and appeal submission button",
                width: 1200,
                height: 675,
                caption: "Google Business Profile suspensions require a calm, evidence-based audit before submitting an appeal.",
            },
        },
        {
            type: "h2",
            text: "2. Common Triggers That Cause Google Suspensions in 2026",
        },
        {
            type: "ul",
            items: [
                "**Keyword Stuffing in Business Name:** Adding modifiers like 'Denver Emergency Plumber 24/7' instead of your registered LLC name violates Google's naming guidelines.",
                "**Unstaffed Virtual Offices & UPS Stores:** Registering commercial P.O. boxes, shared co-working desks, or unstaffed executive suites triggers immediate algorithmic removal.",
                "**Sudden Address or Category Changes:** Editing your primary business address or changing primary categories triggers automated fraud flags requiring re-verification.",
                "**Service Area Business (SAB) Address Exposure:** Displaying a residential home address for a mobile contractor business violates Google guidelines; SABs must hide their physical address.",
            ],
        },
        {
            type: "h2",
            text: "3. The Pre-Appeal Audit: Clean Your Data Before Appealing",
        },
        {
            type: "p",
            text: "Google provides only one primary appeal submission per suspension. If you submit an appeal while your profile still contains policy infractions, manual reviewers will deny reinstatement. Strip all non-branded keywords from your business title, ensure your website URL links to an active domain with consistent NAP data, and verify operating hours match reality.",
        },
        {
            type: "h2",
            text: "4. Assembling Bulletproof Reinstatement Evidence",
        },
        {
            type: "p",
            text: "Google's European and global moderation teams require undeniable evidence of physical operations. Before opening the Appeals Tool, compile a single consolidated PDF containing: (1) Official state or municipal business registration certificate; (2) A utility bill (water, gas, electric, or internet) issued within 60 days showing matching business name and address; (3) High-resolution exterior photos of your building showing permanent, non-vinyl signage; and (4) Commercial lease agreement or deed.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/gbp_reinstatement_evidence_submission.jpg",
                alt: "Organized official business registration license, utility bill, and storefront photos next to laptop showing Google Appeals Tool",
                width: 1200,
                height: 675,
                caption: "Consolidate official business licenses, utility bills, and storefront photos before opening the Appeals Tool.",
            },
        },
        {
            type: "h2",
            text: "5. Step-by-Step Reinstatement Through the Google Appeals Tool",
        },
        {
            type: "p",
            text: "Navigate to the official Google Business Profile Appeals Tool. Select your suspended profile, review the violation category, and click 'Submit an Appeal'. Once initiated, Google grants a strict 60-minute window to upload your consolidated evidence package. State clearly in your submission that you have conducted a comprehensive profile audit, aligned your business name to state records, and attached official operational proof.",
        },
        {
            type: "h2",
            text: "6. Navigating Google Video Verification in 2026",
        },
        {
            type: "p",
            text: "Increasingly, Google demands a live or pre-recorded video verification to finalize reinstatement. The video must be captured in one continuous unedited take demonstrating three pillars: (1) Location context showing street signs and exterior building numbers; (2) Business operations showing branded work vehicles, permanent entrance signage, and unlocking the suite door; and (3) Proof of management showing access to the POS system, business stationery, or inventory room.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/google_review_management_tool_appeal.jpg",
                alt: "Desktop monitor displaying Google Review Management Tool dashboard with appeal status tracking",
                width: 1200,
                height: 675,
                caption: "Track the status of your reinstatement appeal directly inside Google's official appeals portal.",
            },
        },
        {
            type: "h2",
            text: "Post-Reinstatement: Protecting Your Hard-Earned Reputation",
        },
        {
            type: "p",
            text: "Once reinstated, avoid making major profile edits for at least 30 days. Maintain steady review acquisition to re-establish trust signals with Google's local ranking algorithms. Automating review requests through Zyene Reviews ensures a consistent flow of verified customer reviews that solidify your prominence on Google Maps.",
        },
        {
            type: "cta",
            ctaLabel: "Build a Bulletproof Local Reputation with Zyene →",
            ctaHref: SIGNUP_URL,
        },
    ],
};

