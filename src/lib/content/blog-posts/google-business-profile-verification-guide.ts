import type { BlogPostSource } from "@/lib/content/blog-types";
import { SIGNUP_URL } from "@/config/env";

export const googleBusinessProfileVerificationGuidePost: BlogPostSource = {
    slug: "google-business-profile-verification-guide",
    title: "Google Business Profile Verification: Complete 2026 Guide",
    excerpt:
        "Master Google Business Profile verification in 2026. Learn video verification rules, instant methods, document proof, and how to fix verification failures.",
    pillar: "local-seo",
    pillarLabel: "Local SEO",
    publishedAt: "2026-11-23",
    dateModified: "2026-11-23",
    author: { name: "Sienna Brooks", role: "Local Search Optimization & Business Verification Specialist" },
    metaTitle: "Google Business Profile Verification: Complete 2026 Guide",
    metaDescription:
        "Verify your Google Business Profile in 2026. Discover video verification rules, instant phone/email methods, required documents, and fix verification errors.",
    keywords: [
        "google business profile verification",
        "how to verify google business profile",
        "google business profile video verification",
        "google business verification without postcard",
        "instant google business profile verification",
        "verify google business profile 2026",
        "google business profile verification failed",
        "service area business verification google",
    ],
    relatedSlugs: [
        "how-to-fix-suspended-google-business-profile",
        "google-business-profile-optimization-checklist",
        "ranking-higher-on-google-maps-local-seo-playbook",
    ],
    internalLinks: [
        { label: "How to Fix a Suspended Profile", href: "/blog/how-to-fix-suspended-google-business-profile" },
        { label: "Google Business Profile Checklist", href: "/blog/google-business-profile-optimization-checklist" },
        { label: "Ranking Higher on Google Maps Playbook", href: "/blog/ranking-higher-on-google-maps-local-seo-playbook" },
        { label: "Local SEO Audit Checklist", href: "/resources/local-seo-checklist" },
    ],
    faqs: [
        {
            question: "What is the primary Google Business Profile verification method in 2026?",
            answer: "Business video recording has replaced postcards as Google's default verification method. Merchants must record a continuous, unedited video demonstrating external street location, permanent business signage, and proof of operational management.",
        },
        {
            question: "How do I pass Google's business video verification on the first attempt?",
            answer: "Record one uninterrupted video under two minutes: begin at the street showing building numbers and nearby landmarks, film your permanent storefront sign, unlock the facility with your physical key, and show employee access to the POS terminal, official invoices, or inventory.",
        },
        {
            question: "Can you still verify a Google Business Profile by postcard in 2026?",
            answer: "Postcards have been almost entirely phased out by Google in 2026 in favor of real-time video verification, instant domain matching via Google Search Console, and automated telecom carrier phone verification.",
        },
        {
            question: "How do Service Area Businesses (SABs) verify without a physical storefront?",
            answer: "Mobile contractors and SABs record video showing commercial work vehicles with permanent branding, commercial equipment/tools, and access to work dispatch software or branded service contracts. Their residential address must remain hidden.",
        },
        {
            question: "What should I do if my Google Business Profile verification fails or gets stuck?",
            answer: "If verification fails or remains stuck 'In Review' past 5 business days, open the Google Business Profile Help Center, initiate a verification support ticket, and provide official business registration, utility bills, and tax certificates.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "Direct Answer: In 2026, Google Business Profile verification primarily relies on real-time business video recordings rather than traditional mailed postcards. To verify successfully, record a continuous, unedited mobile video capturing three elements: your street location and permanent building signage, physical access through unlocked doors, and proof of management via your point-of-sale system, branded work vehicles, or business licensing documents.",
        },
        {
            type: "p",
            text: "Claiming and verifying your Google Business Profile is the mandatory gatekeeper for appearing in Google Maps and the Local 3-Pack. As Google deploys stricter AI fraud filters to eliminate fake lead-generation listings, the verification process has evolved into an exacting operational audit that catches unprepared business owners in endless verification loops.",
        },
        {
            type: "h2",
            text: "1. Overview of 2026 Google Business Profile Verification Methods",
        },
        {
            type: "table",
            table: {
                headers: ["Verification Method", "Availability", "Turnaround Time", "Common Failure Causes"],
                rows: [
                    ["Business Video Recording", "Default for 85%+ of businesses", "2 to 5 business days", "Edited video, blurry signage, missing address proof"],
                    ["Instant Search Console", "Established domain owners", "Immediate (under 1 minute)", "Account email mismatch, unverified domain root"],
                    ["Phone or SMS Code", "Select low-risk retail categories", "Instant (real-time OTP)", "VoIP numbers, virtual PBX, call-forwarding lines"],
                    ["Live Video Call", "Secondary escalation / appeals", "Scheduled 15-minute call", "Missing original documents, unregistered subleases"],
                ],
            },
        },
        {
            type: "image",
            image: {
                src: "/images/blog/google_business_profile_verification_dashboard.jpg",
                alt: "Laptop screen displaying Google Business Profile verification methods dashboard with video recording highlighted",
                width: 1200,
                height: 675,
                caption: "Google dynamically assigns verification options based on industry risk score and physical footprint.",
            },
        },
        {
            type: "h2",
            text: "2. Mastering the Video Verification Method: The 3-Pillar Rule",
        },
        {
            type: "p",
            text: "Google rejects video recordings that contain cuts, voiceover commentary, or poor lighting. To guarantee approval, plan a continuous walking route covering three strict pillars in under 120 seconds: (1) Location context: begin on the sidewalk showing municipal street signs and building numbers; (2) Business presence: walk up to the entrance showing permanent non-vinyl exterior signage; and (3) Proof of operation: unlock the front door, walk behind the counter, and log into your register or administrative software.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/google_business_profile_video_verification_mobile.jpg",
                alt: "Storefront business owner recording continuous Google video verification on smartphone showing building sign and entrance key",
                width: 1200,
                height: 675,
                caption: "Video verification must be captured in one continuous unedited take demonstrating physical operational control.",
            },
        },
        {
            type: "h2",
            text: "3. Instant Verification Fast-Tracks: Domain & Search Console",
        },
        {
            type: "p",
            text: "The fastest way to bypass manual video reviews is qualifying for instant verification through Google Search Console. If your Google Business Profile uses the same administrative Google Account as your verified website in Search Console, Google frequently grants automated instant verification. Ensure your official domain email (e.g., owner@yourbrand.com) matches the profile primary owner.",
        },
        {
            type: "h2",
            text: "4. Verifying Service Area Businesses (SABs) Without a Storefront",
        },
        {
            type: "p",
            text: "Mobile service contractors (plumbers, mobile detailers, electricians) who serve customers at their locations must register as Service Area Businesses with their home address hidden. For SAB video verification, Google requires filming branded service vans, commercial tools, state contractor licenses, and work dispatch software on your phone, starting from your vehicle's license plate.",
        },
        {
            type: "h2",
            text: "5. Troubleshooting 'Verification Failed' and Stuck Review Loops",
        },
        {
            type: "p",
            text: "If your profile remains stuck in 'Processing' or displays 'Verification Failed', do not create a duplicate listing. Duplicate listings trigger automated hard suspensions. Instead, open the Google Business Profile Verification Support Tool, upload your official business registration and matching utility bills, and request a manual live video appointment with a Google specialist.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/google_business_profile_suspended_dashboard.jpg",
                alt: "Business owner viewing a suspended Google Business Profile dashboard with policy alert and verification assistance button",
                width: 1200,
                height: 675,
                caption: "Avoid creating duplicate listings during verification errors to prevent automated fraud suspensions.",
            },
        },
        {
            type: "h2",
            text: "Critical Verification Traps That Trigger Algorithmic Bans",
        },
        {
            type: "ul",
            items: [
                "**Co-Working Desks & Virtual Offices:** Registering addresses at shared Regus or WeWork spaces without a dedicated, permanently branded office suite results in permanent bans.",
                "**Keyword Stuffing the Legal Name:** Adding city modifiers or services ('Best Dallas Roofing LLC') not present on your legal tax documents triggers immediate fraud flags.",
                "**Using Virtual VoIP Numbers:** Google automatically rejects non-fixed VoIP phone numbers from providers like Google Voice, Skype, or TextNow.",
                "**Mismatched Online Citations:** Conflicting Name, Address, and Phone (NAP) data across Yelp, Facebook, or the BBB creates algorithmic doubt during review.",
            ],
        },
        {
            type: "h2",
            text: "Post-Verification: Accelerating Your Google Map Pack Velocity",
        },
        {
            type: "p",
            text: "Once verified, your profile enters an algorithmic probation period. Gathering high-velocity, authentic customer reviews immediately reinforces your verified status. Connecting your checkout workflow to Zyene Reviews automates customer review prompts, establishing the prominence needed to climb into the top three Google Map Pack rankings.",
        },
        {
            type: "cta",
            ctaLabel: "Automate Your Google Reviews with Zyene →",
            ctaHref: SIGNUP_URL,
        },
    ],
};

