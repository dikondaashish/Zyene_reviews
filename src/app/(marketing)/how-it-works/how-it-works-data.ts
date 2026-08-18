import type { Metadata } from "next";
import Link from "next/link";
import {
    Link2, Bell, Megaphone, TrendingUp, ArrowRight, Check,
    Star, Sparkles, ShieldCheck, BarChart3,
} from "lucide-react";

export const STEPS = [
    {
        step: "01",
        icon: Link2,
        iconBg: "bg-chart-1/10",
        iconColor: "text-chart-1",
        accentColor: "border-l-chart-1",
        title: "Connect",
        headline: "Connect your Google Business Profile in 2 minutes",
        description:
            "Sign up, click 'Connect Google Business Profile,' and authorize Zyene with your Google account. That's it. Your reviews, Q&A, and performance data start syncing immediately. No technical setup required — if you can log into Google, you can connect in seconds.",
        bullets: [
            "One-click OAuth — no API keys needed",
            "Connect multiple locations to a single account",
            "Facebook and Yelp connections available too",
            "Start your 7-day free trial during setup",
        ],
        mockupLines: [
            "✓  Google Business Profile — Connected",
            "✓  Syncing 127 reviews…",
            "✓  3 competitors tracked",
        ],
        mockupBg: "bg-chart-1/5 border-chart-1/30",
    },
    {
        step: "02",
        icon: Bell,
        iconBg: "bg-chart-4/10",
        iconColor: "text-chart-4",
        accentColor: "border-l-chart-4",
        title: "Monitor",
        headline: "Get instant alerts when reviews arrive",
        description:
            "Every new review triggers an instant notification by email or SMS — so you never miss a critical review. Our AI analyzes each review's sentiment and urgency, surfacing the ones that need your immediate attention. One-click AI reply suggestions let you respond professionally in seconds.",
        bullets: [
            "Real-time email & SMS alerts for every new review",
            "AI sentiment analysis flags 1 and 2-star reviews instantly",
            "Unified inbox across all locations and platforms",
            "One-click AI reply suggestion — edit & publish in seconds",
        ],
        mockupLines: [
            "🔔  New 1-star review — Google · 2 min ago",
            'AI Reply: "We\'re sorry to hear this..."',
            "→  Published · 3 min total time",
        ],
        mockupBg: "bg-chart-4/5 border-chart-4/30",
    },
    {
        step: "03",
        icon: Megaphone,
        iconBg: "bg-chart-2/10",
        iconColor: "text-chart-2",
        accentColor: "border-l-chart-2",
        title: "Collect",
        headline: "Send branded requests. Shield bad reviews privately.",
        description:
            "Send branded review request campaigns by SMS, email, or QR code. When a customer reports a bad experience, the Negative Feedback Shield intercepts the request — routing them to a private resolution flow before they ever reach Google. Only happy customers are guided to leave a public review.",
        bullets: [
            "SMS, email, and QR code review requests",
            "Negative Feedback Shield: bad reviews go to you, not Google",
            "AI generates personalized request copy per customer",
            "POS integrations (Square, Clover) trigger requests automatically",
            "Zapier: trigger from any app in your workflow",
        ],
        mockupLines: [
            "📤  Review request sent to John D.",
            "🛡  Negative experience → Private form",
            "⭐⭐⭐⭐⭐  5-star review published on Google",
        ],
        mockupBg: "bg-chart-2/5 border-chart-2/30",
        highlight: true,
    },
    {
        step: "04",
        icon: TrendingUp,
        iconBg: "bg-sync-action/10",
        iconColor: "text-sync-action",
        accentColor: "border-l-sync-action",
        title: "Grow",
        headline: "Track results, compare competitors, improve your Google presence",
        description:
            "Your analytics dashboard tracks review volume, average rating, response rate, and keyword performance over time. The competitor tracker shows how you compare to nearby businesses. The Local SEO dashboard highlights the search terms customers use to find you and the profile details you can improve.",
        bullets: [
            "Review growth charts and rating trend lines",
            "Competitor ranking comparison by location",
            "GBP keyword performance dashboard",
            "Weekly email digest with actionable insights",
            "Export data or connect to your BI tools via API",
        ],
        mockupLines: [
            "📈  Reviews +34%  ·  Rating 4.8 → 4.9",
            "🏆  #1 in your area (was #4 last month)",
            "🔑  Top keyword: 'best dentist near me'",
        ],
        mockupBg: "bg-sync-action/5 border-sync-action/30",
    },
];
export const PROOF_POINTS = [
    { icon: Star, label: "Average rating lift after 90 days", value: "+0.4 ★" },
    { icon: TrendingUp, label: "Review volume increase in first 3 months", value: "+140%" },
    { icon: ShieldCheck, label: "Bad reviews routed privately vs. going public", value: "9 in 10" },
    { icon: BarChart3, label: "Time saved on review responses (vs. manual)", value: "4 hrs/wk" },
];
