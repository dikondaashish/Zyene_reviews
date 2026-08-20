/**
 * Dashboard tour configuration for first-time users.
 * Icon keys map to the same Lucide icons used in the sidebar.
 */

export const TOUR_STEP_ICONS = [
    "panel-left",
    "home",
    "message-square",
    "users",
    "bar-chart-3",
    "settings",
] as const;

export type TourStepIcon = (typeof TOUR_STEP_ICONS)[number];

export interface TourStep {
    target: string;
    title: string;
    description: string;
    placement: "top" | "bottom" | "left" | "right" | "center";
    icon: TourStepIcon;
}

export const dashboardTourSteps: TourStep[] = [
    {
        target: "tour-sidebar",
        title: "Navigation Menu",
        description:
            "Browse all sections from here — Reviews, Campaigns, Customers, Analytics, Integrations, and more. Everything is one click away.",
        placement: "right",
        icon: "panel-left",
    },
    {
        target: "tour-stats",
        title: "Dashboard Results",
        description:
            "Your key metrics at a glance — total reviews, average rating, response rate, and pending reviews. These update in real-time.",
        placement: "bottom",
        icon: "home",
    },
    {
        target: "tour-recent-reviews",
        title: "Review Spotlight",
        description:
            "Your latest Google reviews show up here. Open any card to reply, or jump to the inbox to manage all of them.",
        placement: "right",
        icon: "message-square",
    },
    {
        target: "tour-customers-nav",
        title: "Customers",
        description:
            "Manage your customer database, import contacts, and send personalized review requests via email or SMS.",
        placement: "right",
        icon: "users",
    },
    {
        target: "tour-analytics-nav",
        title: "Reports & Analytics",
        description:
            "Track review trends, customer sentiment, engagement rates, and performance analytics over time.",
        placement: "right",
        icon: "bar-chart-3",
    },
    {
        target: "tour-settings-nav",
        title: "Settings & Profile",
        description:
            "Configure your profile, business info, notifications, billing, and team members all in one place.",
        placement: "right",
        icon: "settings",
    },
];
