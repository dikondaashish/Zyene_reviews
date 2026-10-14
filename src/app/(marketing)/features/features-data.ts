import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Reply, ShieldCheck, BarChart3, TrendingUp,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Code2,
} from "lucide-react";
import { INTEGRATION_BRAND_CHIPS } from "@/lib/marketing/integration-brands";

export const PILLARS = [
    {
        id: "review-monitoring",
        icon: Star,
        iconBg: "bg-accent",
        iconColor: "text-foreground",
        title: "Review Monitoring & Inbox",
        tagline: "Keep connected review feedback in one working view",
        bullets: [
            "Review sync from Google, Facebook, and Yelp",
            "A working review inbox for your active business location",
            "Email and SMS alerts when new reviews arrive",
            "Sentiment analysis to help surface urgent feedback",
            "Filter by rating, platform, location, or date",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        id: "ai-replies",
        icon: Reply,
        iconBg: "bg-accent",
        iconColor: "text-foreground",
        title: "AI Review Replies",
        tagline: "Professional responses in seconds, in your voice",
        bullets: [
            "One-click AI reply suggestions for every review",
            "Professional, Friendly, or Concise reply tones",
            "Automatic replies to new, unanswered Google reviews",
            "Choose eligible star ratings for automatic replies",
            "Review drafts yourself or turn on automatic publishing",
        ],
        cta: { label: "See how it works", href: "/how-it-works" },
    },
    {
        id: "review-collection",
        icon: ShieldCheck,
        iconBg: "bg-accent",
        iconColor: "text-foreground",
        title: "Review Collection & Negative Feedback Shield",
        tagline: "Invite feedback fairly, follow up thoughtfully, and resolve issues sooner.",
        bullets: [
            "Branded review requests by SMS, email, shareable link, or QR code",
            "Optional follow-up reminders for customers who have not engaged",
            "Private feedback and team alerts for timely service recovery",
            "Configurable feedback and service-recovery workflows",
            "Use the API or a secure webhook to trigger requests from your workflow",
        ],
        cta: { label: "See pricing", href: "/pricing" },
        highlight: true,
    },
    {
        id: "competitor-tracking",
        icon: TrendingUp,
        iconBg: "bg-accent",
        iconColor: "text-foreground",
        title: "Competitor Intelligence",
        tagline: "Know exactly where you stand in your market",
        bullets: [
            "Track up to 10 competitors per location",
            "Compare review volume, average rating, and response rate",
            "Spot changes in nearby competitors’ review activity",
            "Use competitor context alongside your own review trends",
            "Keep local comparison in view as you plan improvements",
        ],
        cta: { label: "Start free trial", href: "/signup" },
    },
    {
        id: "local-seo",
        icon: Globe,
        iconBg: "bg-accent",
        iconColor: "text-foreground",
        title: "Local SEO Dashboard",
        tagline: "Understand and improve your Google Business Profile",
        bullets: [
            "Google Business Profile keyword performance tracking",
            "Keyword insights: what customers search to find you",
            "Photo, post, and Q&A management from one dashboard",
            "Local pack ranking estimation for your top keywords",
            "Actionable recommendations to improve your GBP score",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        id: "analytics",
        icon: BarChart3,
        iconBg: "bg-accent",
        iconColor: "text-foreground",
        title: "Analytics & Reporting",
        tagline: "Understand what's working and share results",
        bullets: [
            "Dashboard overview: ratings, volume, response rate, trends",
            "Review and request activity trends over time",
            "Email and SMS request funnel progression",
            "Export review and request data to CSV",
            "Use aggregate analytics through the developer API",
        ],
        cta: { label: "Explore docs", href: "/docs" },
    },
];
export const INTEGRATIONS = INTEGRATION_BRAND_CHIPS;
