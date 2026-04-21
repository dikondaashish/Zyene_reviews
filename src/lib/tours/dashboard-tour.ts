/**
 * Dashboard tour configuration for first-time users
 * Guides users through key features of the dashboard
 */

export interface TourStep {
    target: string; // data-tour-target attribute value
    title: string;
    description: string;
    placement: "top" | "bottom" | "left" | "right" | "center";
    icon: string; // Emoji icon for the step header
}

export const dashboardTourSteps: TourStep[] = [
    {
        target: "tour-sidebar",
        title: "Navigation Menu",
        description:
            "Browse all sections from here — Reviews, Campaigns, Customers, Analytics, Integrations, and more. Everything is one click away.",
        placement: "right",
        icon: "🧭",
    },
    {
        target: "tour-stats",
        title: "Dashboard Results",
        description:
            "Your key metrics at a glance — total reviews, average rating, response rate, and pending reviews. These update in real-time.",
        placement: "bottom",
        icon: "📊",
    },
    {
        target: "tour-recent-reviews",
        title: "Recent Actions",
        description:
            "Your latest reviews appear here for quick action. Respond, analyze sentiment, and stay on top of feedback with ease.",
        placement: "top",
        icon: "💬",
    },
    {
        target: "tour-customers-nav",
        title: "Customers",
        description:
            "Manage your customer database, import contacts, and send personalized review requests via email or SMS.",
        placement: "right",
        icon: "👥",
    },
    {
        target: "tour-analytics-nav",
        title: "Reports & Analytics",
        description:
            "Track review trends, customer sentiment, engagement rates, and performance analytics over time.",
        placement: "right",
        icon: "📈",
    },
    {
        target: "tour-settings-nav",
        title: "Settings & Profile",
        description:
            "Configure your profile, business info, notifications, billing, and team members all in one place.",
        placement: "right",
        icon: "⚙️",
    },
];
