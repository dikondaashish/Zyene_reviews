import Link from "next/link";
import { ArrowRight, MessageSquareText, PenLine, Send } from "lucide-react";
import { HomeJourneyPhone } from "@/components/marketing/marketing-home/home-journey-phone";

const STEPS = [
  {
    icon: Send,
    title: "Ask at the right moment",
    text: "Send a branded request by text or email after a visit, or let customers scan a QR code or tap an NFC stand.",
    href: "/features/review-requests",
  },
  {
    icon: PenLine,
    title: "Make reviewing effortless",
    text: "Your review page drafts a short review from what they liked. They edit it, then post it to Google themselves.",
    href: "/features/review-page",
  },
  {
    icon: MessageSquareText,
    title: "Reply in your voice",
    text: "AI drafts every Google reply in your tone. Approve each one, or let eligible reviews get answered automatically.",
    href: "/features/ai-replies",
  },
];

export function MarketingHomeHowItWorks() {
  return (
    <section className="marketing-section home-how" aria-labelledby="home-how-heading">
      <div className="marketing-container home-how-grid">
        <div>
          <p className="marketing-eyebrow">How it works</p>
          <h2 id="home-how-heading">From a happy visit to a Google review in under a minute.</h2>
          <ol className="home-how-steps">
            {STEPS.map(({ icon: Icon, title, text, href }) => (
              <li key={title}>
                <Icon size={18} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link href={href} className="home-text-link">
                    Learn more<span className="sr-only">: {title}</span> <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <HomeJourneyPhone />
      </div>
    </section>
  );
}
