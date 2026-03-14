import type { Step } from "react-joyride";

/**
 * Dashboard tour configuration for first-time users
 * Guides users through key features of the dashboard
 */

export const dashboardTourSteps: Step[] = [
  {
    target: ".dashboard-main",
    content:
      "Welcome to Zyene Reviews! This is your dashboard where you can manage everything.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".sidebar-navigation",
    content:
      "Use the sidebar to navigate between different sections: Reviews, Campaigns, Customers, and Settings.",
    placement: "right",
  },
  {
    target: ".business-switcher",
    content:
      "Switch between your locations/businesses here. You can manage multiple locations from the same dashboard.",
    placement: "bottom",
  },
  {
    target: ".reviews-section",
    content:
      "View and respond to customer reviews from all your platforms (Google, Yelp, Facebook) in one place.",
    placement: "right",
  },
  {
    target: ".campaigns-section",
    content:
      "Create and manage email & SMS campaigns to send review requests and promotional messages to customers.",
    placement: "right",
  },
  {
    target: ".insights-section",
    content:
      "Track your average rating, total reviews, and customer sentiment analytics in real-time.",
    placement: "left",
  },
  {
    target: ".settings-nav",
    content:
      "Configure notifications, team members, billing, and integrations in Settings.",
    placement: "left",
  },
  {
    target: ".dashboard-main",
    content:
      "🎉 You're all set! Start by checking your reviews or sending your first campaign. You can always restart this tour from the help menu.",
    placement: "center",
  },
];

/**
 * Joyride styles for consistent branding
 */
export const tourStyles = {
  options: {
    arrowColor: "#fff",
    backgroundColor: "#fff",
    primaryColor: "#3b82f6", // blue-500
    textColor: "#1f2937", // gray-800
    width: 350,
    zIndex: 10000,
  },
};
