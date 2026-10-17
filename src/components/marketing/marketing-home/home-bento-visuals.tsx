import Image from "next/image";
import { Check, Sparkles, Star } from "lucide-react";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

/* Small, static slices of the real product with fictional sample data. Decorative: the card copy carries the meaning. */

export function BentoReplyVisual() {
  return (
    <div className="bento-reply" aria-hidden="true">
      <div className="bento-review">
        <div className="bento-review-head">
          <span className="bento-avatar">MR</span>
          <div><strong>Maya R.</strong><small>Google · 2 min ago</small></div>
          <span className="bento-stars">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" />)}</span>
        </div>
        <p>The oat latte was perfect and Sam remembered my name. Best start to a Monday.</p>
      </div>
      <div className="bento-reply-card">
        <div className="bento-reply-meta">
          <span><Sparkles size={13} /> AI reply · Friendly tone</span>
          <span className="bento-status"><Check size={12} /> Published</span>
        </div>
        <p>Thank you, Maya! Sam will be thrilled to hear it. See you next Monday for another oat latte.</p>
      </div>
    </div>
  );
}

export function BentoRequestVisual() {
  return (
    <div className="bento-request" aria-hidden="true">
      <div className="bento-segment"><span className="is-active">Text</span><span>Email</span></div>
      <p className="bento-bubble">
        Hi Jordan, thanks for visiting Juniper Coffee today. Mind sharing how it went? It takes 30 seconds.
        <span>collectratings.com/r/juniper</span>
      </p>
      <small>Reminder on day 7 if there&apos;s no reply</small>
    </div>
  );
}

const THEMES = [
  { label: "Friendly staff", share: 92 },
  { label: "Coffee quality", share: 74 },
  { label: "Cozy seating", share: 41 },
  { label: "Wait time", share: 18, negative: true },
];

export function BentoInsightsVisual() {
  return (
    <div className="bento-themes" aria-hidden="true">
      {THEMES.map(({ label, share, negative }) => (
        <div key={label} className="bento-theme">
          <span>{label}</span>
          <i className={negative ? "is-negative" : undefined} style={{ width: `${share}%` }} />
        </div>
      ))}
      <small>Sample themes from recent reviews</small>
    </div>
  );
}

const ASSISTANTS = [
  { name: "ChatGPT", domain: "chatgpt.com", mentioned: true },
  { name: "Perplexity", domain: "perplexity.ai", mentioned: true },
  { name: "Gemini", domain: "gemini.google.com", mentioned: false },
];

export function BentoVisibilityVisual() {
  return (
    <div className="bento-visibility" aria-hidden="true">
      <p className="bento-query">&ldquo;best coffee shop near Midtown&rdquo;</p>
      <ul>
        {ASSISTANTS.map(({ name, domain, mentioned }) => (
          <li key={name}>
            <Image src={getBrandLogoUrl(domain)} alt="" width={20} height={20} unoptimized />
            <span>{name}</span>
            <em className={mentioned ? "is-yes" : undefined}>{mentioned ? "Mentioned" : "Not yet"}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BentoStandVisual() {
  return (
    <div className="bento-photo">
      <Image
        src="/nfc/review-stand-4.jpg"
        alt="An NFC and QR review stand on a café counter, inviting customers to tap their phone or scan to leave a Google review"
        fill
        sizes="(max-width: 767px) 100vw, 380px"
      />
    </div>
  );
}
