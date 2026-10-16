import {
  Ban, CalendarClock, Eye, MessageSquare, MousePointerClick, MousePointer2, Search, Send, ShieldCheck, UserRound, Users,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  RequestsHeroVisual, RequestsPreviewVisual, RequestsTrackingVisual,
} from "@/components/marketing/feature-landing/visuals/review-requests-visuals";

export const REVIEW_REQUESTS_CONTENT: FeatureLandingContent = {
  slug: "review-requests",
  hero: {
    eyebrow: "SMS & email review requests",
    headline: "Ask for the review while the visit is still fresh.",
    lede: "Pick a saved customer or type a new one, choose text, email or both, and read the exact message before it goes. Send it now or schedule it for later.",
    visual: <RequestsHeroVisual />,
    visualLabel: "Example Send Review Request dialog searching saved customers, with the review text arriving on a phone",
  },
  flow: {
    eyebrow: "How it works",
    title: "One request, start to finish",
    intro: "Open Send Review Request from the Requests page or from a customer’s profile. Here is what happens next.",
    steps: [
      { icon: UserRound, title: "Pick the customer", text: "Type two letters to search your saved customers, or enter a new name, number and email.", sample: "Linda Okafor" },
      { icon: MessageSquare, title: "Choose the channel", text: "SMS, email or both. Both sends the same review link by text and by email.", sample: "SMS · Email · Both" },
      { icon: Eye, title: "Preview the message", text: "See the exact text, the email, and how many requests you have left this month.", sample: "412 SMS left" },
      { icon: CalendarClock, title: "Send now or later", text: "Confirm to send right away, or switch on Schedule for later and pick a date and time.", sample: "Fri · 10:00 AM" },
      { icon: MousePointerClick, title: "Follow the result", text: "Each request shows its status, and Analytics follows it all the way to the Google hand-off.", sample: "Delivered → Clicked" },
    ],
  },
  rows: [
    {
      eyebrow: "Right after the appointment",
      title: "Send it before they reach the car",
      text: "The best time to ask is while the experience is fresh. Pick the customer, check the message, and the request is on its way in a few taps.",
      points: [
        "Search saved customers as you type; their number and email fill in",
        "New customers work too: just type a name, number or email",
        "Texts end with “Reply STOP to opt out.”",
      ],
      media: {
        kind: "photo",
        src: "/images/industries/salons-candid-v2.webp",
        alt: "A stylist combing a smiling client’s silver hair at the end of a salon appointment",
        objectPosition: "center 30%",
        overlay: (
          <>
            <OverlayCard icon={Send} title="Request sent by SMS + email" text="To Linda · Willow Hair Studio" tone="dark" />
            <OverlayCard icon={MousePointer2} title="Link clicked" text="Linda opened your review page" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "No surprises",
      title: "Read the exact message before it goes",
      text: "Before anything is sent, the preview shows who it goes to, when, the text message, and the email subject and body. Go back to edit, or confirm.",
      points: [
        "Your remaining SMS and email allowance for the month",
        "Scheduled requests are checked again at send time",
        "One review link for both messages when you choose Both",
      ],
      media: { kind: "visual", node: <RequestsPreviewVisual />, label: "Preview step showing the SMS and email for a scheduled review request" },
    },
    {
      eyebrow: "After you send",
      title: "Know what happened to every request",
      text: "The Requests page lists each one with its channel and status, from queued and delivered to clicked and completed. Analytics shows the whole funnel in one view.",
      points: [
        "Total sent, delivery rate, click rate and request completion",
        "Sent, delivered, opened, link clicked, completed and Google handoff",
        "Anyone asked in the last 30 days is skipped by default",
      ],
      media: { kind: "visual", node: <RequestsTrackingVisual />, label: "Request list with statuses next to the request funnel" },
    },
  ],
  facts: [
    { value: "3", label: "Ways to send: SMS, email or both" },
    { value: "30 days", label: "Default gap before the same customer is asked again" },
    { value: "500 + 500", label: "SMS and email requests a month on Starter" },
    { value: "6", label: "Funnel stages tracked in Analytics" },
  ],
  capabilities: {
    title: "Small details that make asking easy",
    items: [
      { icon: Search, title: "Customer search", text: "Pick from your saved customers and the channel is set from the details you have." },
      { icon: CalendarClock, title: "Schedule for later", text: "Pick a date and time; the request stays queued until then." },
      { icon: Eye, title: "Message preview", text: "The SMS, the email and your remaining allowance, before you confirm." },
      { icon: ShieldCheck, title: "Re-ask guard", text: "Customers asked recently are skipped. Change the 30-day default in your review settings." },
      { icon: Ban, title: "Opt-outs respected", text: "Numbers that reply STOP and contacts you mark as opted out are not sent requests." },
      { icon: Users, title: "Works with your list", text: "Send from a customer’s profile, or select many customers and continue in the campaign builder." },
    ],
  },
  note: "SMS and email requests count against your plan’s monthly allowance: 500 of each on Starter, 700 of each per location on Professional, unlimited on Enterprise. Zyene tracks clicks and completed requests on your review page; it cannot confirm that Google published a review.",
  faqs: [
    { question: "Can I send a review request by text and email at the same time?", answer: "Yes. Choose Both and the customer gets the same review link by SMS and by email. Both needs a valid mobile number and an email address." },
    { question: "Can I schedule a review request for later?", answer: "Yes. Switch on Schedule for later and pick a date and time at least a minute ahead. The request stays queued until then and is checked again before it sends, so opt-outs and the re-ask limit still apply." },
    { question: "Will a customer be asked twice?", answer: "Not within 30 days by default. If a customer was sent a request recently, a new one is blocked. You can change the number of days in your review settings." },
    { question: "What does the review request text say?", answer: "By default: “Hi [name]! Thanks for visiting [your business]. We’d love your feedback - it only takes 30 seconds: [link]. Reply STOP to opt out.” The preview shows the exact wording before you send." },
    { question: "How many review requests can I send each month?", answer: "Starter includes 500 SMS and 500 email requests a month. Professional includes 700 of each per location, and Enterprise is unlimited. The preview shows how many you have left." },
    { question: "What happens when a customer replies STOP?", answer: "Their number is added to an opt-out list and they won’t get further text requests. Replying START opts them back in." },
  ],
  related: ["review-campaigns", "customer-crm", "review-page"],
  demoTab: "requests",
};
