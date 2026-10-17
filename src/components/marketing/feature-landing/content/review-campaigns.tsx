import {
  BarChart3, Megaphone, PenLine, Repeat, Rocket, ShieldCheck, Timer, Users,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  CampaignsHeroVisual, CampaignsResultsVisual, CampaignsTemplatesVisual,
} from "@/components/marketing/feature-landing/visuals/review-campaigns-visuals";

export const REVIEW_CAMPAIGNS_CONTENT: FeatureLandingContent = {
  slug: "review-campaigns",
  hero: {
    kicker: "Review request campaigns",
    headline: "Ask your whole list at once.",
    lede: "Pick customers, start from a template, and turn on reminders for day 7 and day 14. Reminders stop once someone clicks or completes.",
    visual: <CampaignsHeroVisual />,
    visualLabel: "Example campaign builder on the Timing step, with a 2-hour delay and day 7 and day 14 reminders",
  },
  flow: {
    title: "Four steps from a list to a running campaign",
    intro: "Select customers on the Customers page and continue in the campaign builder, or create a campaign first and add contacts later.",
    steps: [
      { icon: Users, title: "Choose who to ask", text: "Select up to 500 customers. Anyone marked as opted out is left out.", sample: "38 customers selected" },
      { icon: Megaphone, title: "Basics", text: "Name the campaign and pick SMS, email or both.", sample: "Service follow-up · Both" },
      { icon: PenLine, title: "Message", text: "Start from a template or write your own with your customer’s name, your business and the review link.", sample: "{customer_name}" },
      { icon: Timer, title: "Timing", text: "Send immediately or after 1 hour, 2 hours, 4 hours or 1 day, and choose whether to send reminders.", sample: "2 hours · Day 7 · Day 14" },
      { icon: Rocket, title: "Review & launch", text: "Check the preview with a sample customer, then queue it or save it as a draft.", sample: "Queue for 38 customers" },
    ],
  },
  rows: [
    {
      eyebrow: "After the job is done",
      title: "Follow up with everyone you served this week",
      text: "Select the customers you saw, choose Appointment Follow-up and set a delay. Each person gets a message with their own name and your review link.",
      points: [
        "SMS, email or both for each campaign",
        "Opted-out customers and anyone asked in the last 30 days are skipped",
        "Save as a draft if you are not ready to send",
      ],
      media: {
        kind: "photo",
        src: "/images/industries/auto-repair-candid-v2.webp",
        alt: "A mechanic working under the open hood of a car in a busy repair shop",
        objectPosition: "center 35%",
        overlay: (
          <>
            <OverlayCard icon={Rocket} title="Queued for 38 customers" text="Northside Auto · first message in 2 hours" tone="dark" />
            <OverlayCard icon={Repeat} title="Day 7 reminder" text="Skipped for anyone who already clicked" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "Start from a template",
      title: "Three templates, each with sensible defaults",
      text: "A template fills in the channel, the message and the timing for you. Change any of it before you launch.",
      points: [
        "Post-Visit Review: SMS, 1 hour after, reminders on",
        "Appointment Follow-up: SMS and email, 2 hours after",
        "Customer Re-engagement: email, sent right away, reminders on",
      ],
      media: { kind: "visual", node: <CampaignsTemplatesVisual />, label: "The three campaign templates and the Appointment Follow-up message" },
    },
    {
      eyebrow: "Keep it going",
      title: "See how it’s going, and add people anytime",
      text: "Every campaign has its own page with sent, opened, clicked and completed counts, a conversion funnel and each contact’s status. Pause it, or add more contacts.",
      points: [
        "Pause and reactivate a campaign",
        "Add one contact, or paste phone numbers one per line",
        "Each contact’s channel and status at a glance",
      ],
      media: { kind: "visual", node: <CampaignsResultsVisual />, label: "Campaign page with stats, contacts and the Add Contacts dialog" },
    },
  ],
  facts: [
    { value: "3", label: "Ready-made campaign templates" },
    { value: "5", label: "Send delay options, from immediately to 1 day" },
    { value: "Day 7 & 14", label: "Optional reminders that stop after a click" },
    { value: "500", label: "Customers per campaign launch" },
  ],
  capabilities: {
    title: "Everything a campaign needs",
    items: [
      { icon: Megaphone, title: "SMS, email or both", text: "Pick the channel for each campaign." },
      { icon: PenLine, title: "Editable messages", text: "Change the SMS, the email subject and the body. Email supports HTML." },
      { icon: Timer, title: "Send delay", text: "Immediately, or 1 hour, 2 hours, 4 hours or 1 day after contacts are added." },
      { icon: Repeat, title: "Reminder drip", text: "Reminders on day 7 and day 14, with an optional separate message for day 14." },
      { icon: ShieldCheck, title: "Built-in guardrails", text: "Opt-outs and your re-ask window are checked before each message." },
      { icon: BarChart3, title: "Campaign stats", text: "Sent, opened, clicked and completed, plus each contact’s status." },
    ],
  },
  note: "Campaigns send after the delay you choose; they can’t be set for a specific date and time. To send one request at a set time, use Schedule for later on a single request. Every message counts against your plan’s monthly SMS and email allowance.",
  faqs: [
    { question: "Can I schedule a campaign for a specific date and time?", answer: "Not at the moment. Campaigns send immediately or after a delay of 1 hour, 2 hours, 4 hours or 1 day. If one request needs to go out at an exact time, use Schedule for later when you send a single request." },
    { question: "How do the reminders work?", answer: "Turn on the reminder drip and customers get a reminder on day 7 and another on day 14. Reminders stop once the customer clicks the link or completes the request. You can write a separate day 14 message or reuse the day 7 one." },
    { question: "Which campaign templates are included?", answer: "Post-Visit Review, Appointment Follow-up and Customer Re-engagement. Each one fills in a channel, a message and a delay that you can change." },
    { question: "How many customers can I add to a campaign?", answer: "Up to 500 when you launch from selected customers. You can add more later on the campaign page, one at a time or by pasting phone numbers." },
    { question: "Will customers who opted out get campaign messages?", answer: "No. Opted-out customers are left out when you select them, and opt-outs and your re-ask window are checked again before each message is sent." },
  ],
  related: ["review-requests", "customer-crm", "review-collection"],
};
