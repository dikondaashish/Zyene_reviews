import {
    BarChart3, Bell, BellRing, CheckCircle2, KeyRound, Link2, Megaphone,
    Send, ShieldCheck, Star, Sparkles, TrendingUp, Trophy,
} from "lucide-react";

export const STEPS = [
    {
        step: "01",
        icon: Link2,
        iconBg: "bg-chart-1/10",
        iconColor: "text-chart-1",
        accentColor: "border-l-chart-1",
        title: "Connect",
        headline: "Connect your profile and make the first request easy",
        description:
            "Connect your Google Business Profile, set up a branded review page, and bring the review work your team already does into one repeatable routine.",
        bullets: [
            "Connect Google Business Profile through OAuth",
            "Create a branded review page and shareable link",
            "Download a QR code for in-person requests",
            "Add Facebook and Yelp review sync when it fits your workflow",
        ],
        mockupLines: [
            { icon: CheckCircle2, label: "Google Business Profile, connected" },
            { icon: CheckCircle2, label: "Branded review page, ready" },
            { icon: Link2, label: "Shareable review link, ready" },
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
        headline: "See what needs a response while it is still fresh",
        description:
            "Keep reviews and private feedback in view, then use AI to get a thoughtful Google reply started in your team’s voice. You stay in control of the final response.",
        bullets: [
            "Review and private-feedback alerts for your active location",
            "Google, Facebook, and Yelp review sync in one working view",
            "AI reply suggestions with tone controls",
            "Review, edit, and publish Google replies from Zyene",
        ],
        mockupLines: [
            { icon: BellRing, label: "New review needs attention" },
            { icon: Sparkles, label: 'AI reply: "We\'re sorry to hear this…"' },
            { icon: CheckCircle2, label: "Reviewed and ready to publish" },
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
        headline: "Invite feedback. Follow up thoughtfully.",
        description:
            "Send branded review requests by SMS, email, shareable link, or QR code. Add an optional follow-up reminder, then use Negative Feedback Shield to capture private feedback and alert your team when service recovery is needed.",
        bullets: [
            "SMS, email, shareable-link, and QR review requests",
            "Optional follow-up reminders for customers who have not engaged",
            "Private feedback alerts for timely service recovery",
            "Configurable feedback and service-recovery workflows",
            "Use the API or a secure webhook to trigger requests from your workflow",
        ],
        mockupLines: [
            { icon: Send, label: "Branded request ready to send" },
            { icon: ShieldCheck, label: "Private feedback alert for your team" },
            { icon: Link2, label: "Public review path remains available" },
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
        title: "Improve",
        headline: "Turn review patterns into your next improvement",
        description:
            "Review request activity, ratings, response coverage, competitor context, and Google Business Profile signals in one place. Use that context to decide what your team will improve next.",
        bullets: [
            "Email and SMS request activity and funnel progress",
            "Review volume, rating, and response trends",
            "Competitor context for your active location",
            "Google Business Profile keyword performance signals",
            "Export review and request data for deeper analysis",
        ],
        mockupLines: [
            { icon: TrendingUp, label: "Review and request trends" },
            { icon: Trophy, label: "Nearby competitor context" },
            { icon: KeyRound, label: "Google Business Profile keyword signals" },
        ],
        mockupBg: "bg-sync-action/5 border-sync-action/30",
    },
];
export const PROOF_POINTS = [
    { icon: Star, label: "Review activity", value: "Trends over time" },
    { icon: BarChart3, label: "Request funnel", value: "Delivery to engagement" },
    { icon: ShieldCheck, label: "Private feedback", value: "Clear team follow-up" },
    { icon: Sparkles, label: "AI reply support", value: "A thoughtful first draft" },
];
