import Image from "next/image";
import { Check, Sparkles, Star } from "lucide-react";
import { at, Words } from "@/components/marketing/marketing-home/home-motion-text";

/* Small, static slices of the real product with fictional sample data. Decorative: the card copy carries
 * the meaning. They play once when the bento scrolls into view (m-* classes, marketing-home-motion.css). */

export function BentoReplyVisual() {
  return (
    <div className="bento-reply" aria-hidden="true">
      <div className="bento-review m-up" style={at(0.2)}>
        <div className="bento-review-head">
          <span className="bento-avatar">MR</span>
          <div><strong>Maya R.</strong><small>Google · 2 min ago</small></div>
          <span className="bento-stars">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" />)}</span>
        </div>
        <p>The oat latte was perfect and Sam remembered my name. Best start to a Monday.</p>
      </div>
      <div className="bento-reply-card m-up" style={at(0.9)}>
        <div className="bento-reply-meta">
          <span><Sparkles size={13} /> AI reply · Friendly tone</span>
          <span className="bento-status m-pop" style={at(3.4)}><Check size={12} /> Published</span>
        </div>
        <p><Words text="Thank you, Maya! Sam will be thrilled to hear it. See you next Monday for another oat latte." start={1.4} /></p>
      </div>
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
      <svg className="bento-trend" viewBox="0 0 240 56">
        <path className="m-draw" style={at(0.2)} pathLength={1} d="M2 46 C 30 44, 44 38, 66 39 S 104 30, 126 26 S 168 22, 186 14 S 222 9, 238 6" />
        <circle className="m-pop" style={at(1.5)} cx="238" cy="6" r="3.5" />
      </svg>
      {THEMES.map(({ label, share, negative }, index) => (
        <div key={label} className="bento-theme">
          <span>{label}</span>
          <i className={`m-grow-x${negative ? " is-negative" : ""}`} style={{ ...at(0.6 + index * 0.15), width: `${share}%` }} />
        </div>
      ))}
      <small>Rating trend and top themes</small>
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
