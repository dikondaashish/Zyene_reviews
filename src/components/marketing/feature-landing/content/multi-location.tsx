import {
  ArrowLeftRight, Building2, Gauge, LayoutList, QrCode, ShieldCheck, Store, UserPlus,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  MultiLocationAllowanceVisual, MultiLocationHeroVisual, MultiLocationTeamVisual,
} from "@/components/marketing/feature-landing/visuals/multi-location-visuals";

export const MULTI_LOCATION_CONTENT: FeatureLandingContent = {
  slug: "multi-location",
  hero: {
    kicker: "Multi-location",
    headline: "Run every location from one place.",
    lede: "Switch between businesses in a click, give each team the right access, and keep each location’s review page, QR code and settings.",
    visual: <MultiLocationHeroVisual />,
    visualLabel: "Example businesses list with three dental offices and the business switcher open",
  },
  flow: {
    title: "From one location to many without starting over",
    intro: "Your organization holds your plan. Each business inside it is a location with its own reviews, links and team.",
    steps: [
      { icon: Building2, title: "Your organization", text: "Your plan, billing and locations live in one organization.", sample: "Bright Smile Dental Group" },
      { icon: Store, title: "Add each location", text: "Connect its Google Business Profile, even from a different Google account.", sample: "+ Add a Business" },
      { icon: UserPlus, title: "Invite the team", text: "Invite people to a location as admin, manager, member or viewer.", sample: "Priya · Manager" },
      { icon: ArrowLeftRight, title: "Switch in a click", text: "The business switcher changes which location you are working on.", sample: "Downtown → Lakeview" },
      { icon: QrCode, title: "Run each location", text: "Every location has its own review page link, QR code and settings.", sample: "collectratings.com/bright-smile-lakeview" },
    ],
  },
  rows: [
    {
      eyebrow: "The right people, the right location",
      title: "Give each office manager what they need, and no more",
      text: "Roles are set per business. Invite your front-desk lead to one office, and add a regional admin to each office they look after.",
      points: [
        "Five roles: owner, admin, manager, member, viewer",
        "Owners and admins can invite any role; managers invite managers and members",
        "Team seats: 5 on Starter, 15 on Professional, unlimited on Enterprise",
      ],
      media: {
        kind: "photo",
        src: "/marketing/about/team-collaboration-candid-v2.webp",
        alt: "Three colleagues around a laptop at a wooden table, one taking notes",
        objectPosition: "center 35%",
        overlay: (
          <>
            <OverlayCard icon={UserPlus} title="Invite sent" text="Priya joins Northside as a manager" tone="dark" />
            <OverlayCard icon={ArrowLeftRight} title="Switched to Lakeview" text="Reviews and requests now show Lakeview" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "Team settings",
      title: "See who has access at a glance",
      text: "Each location’s team page lists its people and their roles, with the seats you have left. Change a role or remove someone in a few clicks.",
      points: [
        "Invite by email to a specific location",
        "Change a role or remove someone from the team list",
        "Pending invites count toward your seats until accepted",
      ],
      media: { kind: "visual", node: <MultiLocationTeamVisual />, label: "Team settings for one location with five members and their roles" },
    },
    {
      eyebrow: "Room to grow",
      title: "Your allowance grows with every location",
      text: "On Professional, each location adds its own monthly request allowance to a shared pool for the organization, so a busy office can use what a quiet one does not.",
      points: [
        "700 SMS, 700 email and 2,000 link requests a month per location on Professional",
        "Starter covers one location with 500 SMS, 500 email and 1,500 link requests",
        "Enterprise has unlimited locations and requests",
      ],
      media: { kind: "visual", node: <MultiLocationAllowanceVisual />, label: "Three location review links and a shared monthly SMS allowance meter" },
    },
  ],
  facts: [
    { value: "1 · 3 · ∞", label: "Locations on Starter · Professional · Enterprise" },
    { value: "5", label: "Team roles, from owner to viewer" },
    { value: "15", label: "Team seats on Professional (5 on Starter)" },
    { value: "700", label: "SMS and email requests a month per location on Professional" },
  ],
  capabilities: {
    title: "Built for owners with more than one door",
    items: [
      { icon: ArrowLeftRight, title: "Business switcher", text: "Move between locations from the top of any page." },
      { icon: Building2, title: "Organization switcher", text: "Belong to more than one organization? Switch between them too." },
      { icon: LayoutList, title: "Businesses list", text: "Rating, review count, pending reviews and Google status for every location." },
      { icon: QrCode, title: "Per-location tools", text: "Each location has its own review page, link, QR code and settings." },
      { icon: ShieldCheck, title: "Roles per location", text: "Choose each person’s role, location by location." },
      { icon: Gauge, title: "Clear plan usage", text: "See how many locations you use and upgrade when you need more." },
    ],
  },
  note: "Starter includes 1 location, Professional 3 and Enterprise unlimited; talk to sales for more than 3. On Professional, request allowances add up per location and are shared across the organization. Dashboards, reviews and reports show one location at a time; there is no combined agency dashboard. Seat limits are checked for each business.",
  faqs: [
    { question: "How many locations can I manage in Zyene?", answer: "Starter covers 1 location, Professional covers 3, and Enterprise has no limit. When you reach your plan’s limit, the Add a Business option links to your plan options." },
    { question: "Are review request limits per location?", answer: "On Professional, each location adds 700 SMS, 700 email and 2,000 link requests a month to one shared pool for your organization. Starter has 500 SMS, 500 email and 1,500 link requests for its one location. Enterprise is unlimited." },
    { question: "Does each location get its own review link and QR code?", answer: "Yes. Every location has its own review page at collectratings.com, its own QR code and its own settings, so reviews go to the right Google profile." },
    { question: "Can I give a manager access to only one location?", answer: "Yes. Roles are set per business. Invite someone to a location as an admin, manager, member or viewer, and they work with that location." },
    { question: "Can my locations use different Google accounts?", answer: "Yes. When you add a business, you can connect a different Google account from the one you signed up with and pick which location to add." },
    { question: "Can I see all locations in one view?", answer: "The Businesses page lists every location with its rating, review count, pending reviews and Google connection status. Detailed dashboards and reports are per location." },
  ],
  related: ["review-requests", "review-page", "analytics"],
};
