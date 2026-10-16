import {
  CheckCircle2, CreditCard, Link2, MousePointerClick, Nfc, QrCode, ScanLine, ShieldCheck, ShoppingCart, Smartphone, Truck,
} from "lucide-react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import { NfcStandsCartVisual, NfcStandsHeroVisual } from "@/components/marketing/feature-landing/visuals/nfc-review-stands-visuals";

export const NFC_REVIEW_STANDS_CONTENT: FeatureLandingContent = {
  slug: "nfc-review-stands",
  hero: {
    eyebrow: "NFC review stands",
    headline: "A tap at the counter opens your review page.",
    lede: "Order NFC review stands from inside Zyene Reviews for $4.99 each. Customers tap their phone or scan the printed QR code, and your branded review page opens. No app, no typing.",
    visual: <NfcStandsHeroVisual />,
    visualLabel: "Example in-app order screen for an NFC review stand",
  },
  flow: {
    eyebrow: "How it works",
    title: "From the dashboard to the counter",
    intro: "Ordering happens inside the app, and the stands arrive linked to the location you ordered them for.",
    steps: [
      { icon: MousePointerClick, title: "Open the order screen", text: "Click Order now on the review link card in your dashboard.", sample: "Order now" },
      { icon: ShoppingCart, title: "Choose how many", text: "Anywhere from 1 to 20 stands, at $4.99 each.", sample: "− 3 +" },
      { icon: Truck, title: "Pick a delivery speed", text: "Standard in 5–8 business days or expedited in 2–3.", sample: "$4.99 or $6.99" },
      { icon: CreditCard, title: "Pay with Stripe", text: "Card and shipping address go into Stripe’s secure checkout.", sample: "Pay $19.96 with Stripe" },
      { icon: Nfc, title: "Tap or scan", text: "The stand opens your location’s review page.", sample: "collectratings.com/corner-cafe" },
    ],
  },
  rows: [
    {
      eyebrow: "At the counter",
      title: "Tap a phone, open your review page",
      text: "Customers hold their phone near the stand. If their phone does not read NFC, they scan the QR code printed on the same stand. Both open your review page.",
      points: [
        "Works on iPhone and Android, nothing to install",
        "Sized for checkout counters, desks and tables",
        "Same page, threshold and private feedback as your QR code",
      ],
      media: {
        kind: "photo",
        src: "/nfc/review-stand-4.jpg",
        alt: "A black NFC review stand with a Google logo, five stars, a tap icon and a QR code, next to a potted plant",
        overlay: (
          <>
            <OverlayCard icon={Nfc} title="Phone tapped the stand" text="Corner Café review page opened" tone="dark" />
            <OverlayCard icon={ScanLine} title="No NFC? Scan the code" text="The printed QR code opens the same page" />
          </>
        ),
      },
    },
    {
      eyebrow: "Ordering",
      title: "Order in about a minute",
      text: "Pick a quantity, choose a delivery speed and pay on Stripe’s checkout. You never leave your dashboard until it is time to pay.",
      points: [
        "$4.99 per stand, 1 to 20 per order",
        "Standard shipping $4.99 (5–8 business days) or expedited $6.99 (2–3 business days)",
        "Ships to the US and Canada",
      ],
      media: { kind: "visual", node: <NfcStandsCartVisual />, label: "Cart step with delivery speed, totals and the Stripe button" },
    },
    {
      eyebrow: "Before you order",
      title: "Each stand belongs to one location",
      text: "Stands are linked to the review page of the location you order from. Switch to the right location first, and keep its review link the same so the stands keep working.",
      points: [
        "The NFC chip and the QR code both carry your review link",
        "Changing the link later stops existing stands from working",
        "You see a confirmation in your dashboard once Stripe confirms payment",
      ],
      media: {
        kind: "photo",
        src: "/nfc/review-stand-6.jpg",
        alt: "A white NFC review stand with a Google logo, five stars, a tap icon and a QR code on a wooden table",
        overlay: <OverlayCard icon={CheckCircle2} title="NFC stand order placed" text="Stripe confirmed payment" tone="positive" />,
      },
    },
  ],
  facts: [
    { value: "$4.99", label: "Per stand" },
    { value: "1–20", label: "Stands per order" },
    { value: "2–3 days", label: "Expedited delivery in business days, for $6.99" },
    { value: "US & Canada", label: "Where stands ship" },
  ],
  capabilities: {
    title: "A small stand that does the asking",
    items: [
      { icon: Nfc, title: "Tap to open", text: "Phones that read NFC open your page with a tap." },
      { icon: QrCode, title: "QR code included", text: "A printed code on the same stand for every other phone." },
      { icon: Link2, title: "Pre-linked", text: "Linked to your location’s review page before it ships." },
      { icon: ShoppingCart, title: "Order in the app", text: "Quantity, delivery speed and Stripe checkout in one dialog." },
      { icon: Smartphone, title: "No app needed", text: "Works in the phone’s browser on iPhone and Android." },
      { icon: ShieldCheck, title: "Private feedback", text: "Ratings below your threshold still go to a private form first." },
    ],
  },
  note: "Stands are a one-time purchase, separate from your plan, and the review page they open needs a paid plan or trial. After payment you see a confirmation in your dashboard; shipment tracking is not shown in the app. Changing your review link stops existing stands from working.",
  faqs: [
    { question: "How does an NFC review stand work?", answer: "The stand has an NFC chip and a printed QR code, both carrying your review link. A customer taps their phone on the stand, or scans the code, and your branded review page opens in their browser." },
    { question: "Do customers need an app to use an NFC stand?", answer: "No. It works on iPhone and Android without installing anything. Phones that do not read NFC can scan the printed QR code instead." },
    { question: "How much do NFC review stands cost?", answer: "$4.99 per stand, 1 to 20 per order, plus shipping: $4.99 standard or $6.99 expedited. You order and pay inside Zyene Reviews through Stripe’s checkout." },
    { question: "How long does shipping take, and where do you ship?", answer: "Standard shipping takes 5–8 business days and expedited takes 2–3 business days. Stands ship to the US and Canada." },
    { question: "Can I track my NFC stand order?", answer: "Zyene shows a confirmation once Stripe confirms payment. Shipment tracking is not available in the app." },
    { question: "Will a low rating from the stand go to Google?", answer: "The stand opens the same review page as your other channels. Ratings below your threshold see a private feedback form first, which still has a “Go to Google” link." },
  ],
  related: ["qr-code-reviews", "review-page", "review-collection"],
};
