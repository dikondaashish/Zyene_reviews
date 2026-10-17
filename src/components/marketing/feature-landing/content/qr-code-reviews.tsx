import {
  BarChart3, Copy, Download, Link2, MapPin, Printer, QrCode, ScanLine, Smartphone, Star,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  QrCodeHeroVisual, QrCodeLinkVisual, QrCodePortalCardVisual,
} from "@/components/marketing/feature-landing/visuals/qr-code-reviews-visuals";

export const QR_CODE_REVIEWS_CONTENT: FeatureLandingContent = {
  slug: "qr-code-reviews",
  hero: {
    kicker: "Review QR codes",
    headline: "Print it once. Let every table ask.",
    lede: "Every location gets a QR code and short link. Print the ready-made poster, put it where customers wait, and each scan opens your page.",
    visual: <QrCodeHeroVisual />,
    visualLabel: "Example printed QR poster next to a phone showing the review page it opens",
  },
  flow: {
    title: "From your dashboard to the counter",
    intro: "There is nothing to set up beyond your review page. The code is ready the moment your location is.",
    steps: [
      { icon: QrCode, title: "Get your code", text: "Each location’s QR code is on the review link card in your dashboard.", sample: "Show QR code" },
      { icon: Printer, title: "Print or download", text: "Print the poster with your logo and colors, or save it as an image.", sample: "Print poster · Download" },
      { icon: ScanLine, title: "Customers scan", text: "The phone camera opens your page. No app, no account.", sample: "collectratings.com/corner-cafe" },
      { icon: Star, title: "They rate the visit", text: "Happy customers get a draft for Google. Lower ratings see a private form.", sample: "★★★★★" },
      { icon: BarChart3, title: "See it in analytics", text: "Scans count in the Link channel, together with shared-link visits.", sample: "Channel: Link" },
    ],
  },
  rows: [
    {
      eyebrow: "Where the visit happens",
      title: "Ask while they are still at the table",
      text: "Put the poster by the register, on tables or on the door. Customers scan it while the visit is fresh, and the review page does the rest.",
      points: [
        "Works with the phone’s built-in camera",
        "Opens your branded review page, no app or account",
        "Use the same link on receipts, menus and your website",
      ],
      media: {
        kind: "photo",
        src: "/images/industries/restaurants.webp",
        alt: "A busy restaurant dining room with guests sharing plates at wooden tables",
        overlay: (
          <>
            <OverlayCard icon={ScanLine} title="Scanned from the table poster" text="Corner Café review page opened" tone="dark" />
            <OverlayCard icon={Copy} title="Review drafted and copied" text="Opening the Google review form" tone="positive" />
          </>
        ),
      },
    },
    {
      eyebrow: "From your dashboard",
      title: "Copy, share, download or print",
      text: "The review link card on your dashboard holds the code for the location you are viewing. Copy the link, share it from your phone, download the poster or print it.",
      points: [
        "Poster with your logo, business name and brand color",
        "The downloaded poster is a 2,400-pixel-wide image",
        "Share link opens your phone’s share sheet when it has one",
      ],
      media: { kind: "visual", node: <QrCodePortalCardVisual />, label: "Dashboard card with the QR code and its actions" },
    },
    {
      eyebrow: "Your link",
      title: "A short link you choose, and plain numbers",
      text: "Choose the words after collectratings.com/ in Settings. Scans show up in analytics in the Link channel, together with visits from links you share.",
      points: [
        "Lowercase letters, numbers and hyphens, at least 3 characters",
        "We check the name is free before you save it",
        "Changing it stops printed codes from working, so pick it before you print",
      ],
      media: { kind: "visual", node: <QrCodeLinkVisual />, label: "Review link settings and requests by channel" },
    },
  ],
  facts: [
    { value: "1", label: "QR code and short link for each location" },
    { value: "2,400 px", label: "Width of the downloaded poster image" },
    { value: "0", label: "Apps your customers need to install" },
    { value: "$0", label: "Extra for QR codes on paid plans and trials" },
  ],
  capabilities: {
    title: "A QR code that does more than open a link",
    items: [
      { icon: MapPin, title: "One per location", text: "Each location has its own code, link and review page." },
      { icon: Printer, title: "Print-ready poster", text: "Logo, business name, stars and the code, in your brand color." },
      { icon: Download, title: "Download", text: "Save the poster as a high-resolution image for your own designs." },
      { icon: Link2, title: "Custom link", text: "Pick the name after collectratings.com/ for each location." },
      { icon: Smartphone, title: "Full review page", text: "Rating, tags, an AI draft and private feedback, like every other channel." },
      { icon: BarChart3, title: "Counted in analytics", text: "Scans are part of the Link channel with shared-link visits." },
    ],
  },
  note: "Analytics counts QR scans and shared-link visits together as one Link channel; scans are not reported on their own. The code points straight at your review link, so changing the link stops printed codes from working. The review page needs a paid plan or trial.",
  faqs: [
    { question: "How do I make a QR code for Google reviews?", answer: "In Zyene, you do not have to make one. Every location already has a QR code on the review link card in your dashboard. Print the poster or download it, and each scan opens your review page, which hands happy customers off to your Google review form." },
    { question: "Does the QR code go straight to Google?", answer: "No. It opens your review page first. Customers rate the visit; at or above your threshold they get help writing a review and one tap opens Google. Below it they see a private feedback form, which still has a “Go to Google” link." },
    { question: "Can I print a QR code poster for my counter or tables?", answer: "Yes. Print poster opens a ready-made design with your logo, business name, five stars, the code and your link. Download saves the same poster as an image." },
    { question: "Can I see how many people scanned my QR code?", answer: "Scans are counted in analytics as part of the Link channel, together with visits from links you share. Zyene does not report QR scans separately." },
    { question: "What happens if I change my review link?", answer: "The old link stops working, and so do QR codes and materials you already printed. Settings warns you before you save. Choose your link name before you print." },
    { question: "Do I need a different QR code for each location?", answer: "Each location has its own review page, link and QR code, so reviews go to the right Google listing." },
  ],
  related: ["nfc-review-stands", "review-page", "review-collection"],
};
