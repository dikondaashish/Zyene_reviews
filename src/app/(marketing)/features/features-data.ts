import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Bot, ShieldCheck, BarChart3, TrendingUp, Sparkles,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Zap, Code2,
} from "lucide-react";
import { INTEGRATION_BRAND_CHIPS } from "@/lib/marketing/integration-brands";

export const PILLARS = [
    {
        id: "review-monitoring",
        icon: Star,
        iconBg: "bg-chart-4/10",
        iconColor: "text-chart-4",
        title: "Review Monitoring & Inbox",
        tagline: "Never miss a review — across every platform",
        bullets: [
            "Real-time sync from Google, Facebook, and Yelp",
            "Unified inbox for all reviews across all locations",
            "Instant email & SMS alerts when new reviews arrive",
            "Sentiment analysis automatically flags urgent reviews",
            "Filter by rating, platform, location, or date",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        id: "ai-replies",
        icon: Bot,
        iconBg: "bg-chart-1/10",
        iconColor: "text-chart-1",
        title: "AI-Powered Review Replies",
        tagline: "Professional responses in seconds, in your voice",
        bullets: [
            "One-click AI reply suggestions for every review",
            "Tone customization: formal, friendly, apologetic",
            "Auto-commenter: hands-free replies with owner approval",
            "Personalized context (customer name, visit details)",
            "Consistent brand voice across your team",
        ],
        cta: { label: "See how it works", href: "/how-it-works" },
    },
    {
        id: "review-collection",
        icon: ShieldCheck,
        iconBg: "bg-chart-2/10",
        iconColor: "text-chart-2",
        title: "Review Collection & Negative Feedback Shield",
        tagline: "Get more 5-star reviews. Route bad ones privately.",
        bullets: [
            "Branded review request campaigns via SMS & email",
            "Shareable QR codes for in-person review collection",
            "Negative Feedback Shield routes unhappy customers to private resolution before they go public on Google",
            "POS & automation triggers (Square, Clover, Zapier)",
            "AI-generated review prompt crafted for each customer",
        ],
        cta: { label: "See pricing", href: "/pricing" },
        highlight: true,
    },
    {
        id: "competitor-tracking",
        icon: TrendingUp,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        title: "Competitor Intelligence",
        tagline: "Know exactly where you stand in your market",
        bullets: [
            "Track up to 10 competitors per location",
            "Compare review volume, average rating, and response rate",
            "Identify competitor weaknesses to outperform",
            "Weekly competitive digest delivered to your inbox",
            "Map view: see your ranking vs. nearby businesses",
        ],
        cta: { label: "Start free trial", href: "/signup" },
    },
    {
        id: "local-seo",
        icon: Globe,
        iconBg: "bg-sync-action/10",
        iconColor: "text-sync-action",
        title: "Local SEO Dashboard",
        tagline: "Optimize your Google Business Profile to rank higher",
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
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
        title: "Analytics & Reporting",
        tagline: "Understand what's working and share results",
        bullets: [
            "Dashboard overview: ratings, volume, response rate, trends",
            "Review growth charts over time (weekly/monthly)",
            "Team performance reports for multi-member accounts",
            "Export data to CSV or via API",
            "Scheduled automated email reports",
        ],
        cta: { label: "Explore docs", href: "/docs" },
    },
];
export const INTEGRATIONS = INTEGRATION_BRAND_CHIPS;
