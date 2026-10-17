import Image from "next/image";
import { Check, Copy, MessageCircle, Sparkles, Star } from "lucide-react";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";
import { at, Words } from "@/components/marketing/marketing-home/home-motion-text";

/* Choreographed phone scenes for the homepage flow player. Fictional business and data.
 * Every element's resting state is its final state; delays only apply when motion is allowed. */

function Stars({ start }: { start: number }) {
  return (
    <span className="flow-stars">
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={22} fill="currentColor" style={at(start + i * 0.16)} />)}
    </span>
  );
}

export function FlowAskScene() {
  return (
    <div className="flow-scene flow-scene--ask">
      <p className="flow-lock-time">9:41</p>
      <p className="flow-lock-date">Tuesday, October 21</p>
      <div className="flow-notification m-down" style={at(0.4)}>
        <span className="flow-notification-icon"><MessageCircle size={16} fill="currentColor" /></span>
        <div>
          <p><strong>Juniper Coffee</strong><small>now</small></p>
          <p>Thanks for stopping by today, Jordan! Mind sharing how it went? It takes 30 seconds.</p>
          <p className="flow-link">collectratings.com/r/juniper</p>
        </div>
        <span className="m-tap" style={at(3.4)} />
      </div>
      <p className="flow-caption m-up" style={at(1.6)}>Sent automatically after checkout</p>
    </div>
  );
}

const TAGS = [
  { label: "Friendly staff", at: 1.8 },
  { label: "Great coffee", at: 2.1 },
  { label: "Quick service" },
  { label: "Fresh pastries", at: 2.4 },
];

export function FlowCollectScene() {
  return (
    <div className="flow-scene flow-scene--collect">
      <div className="flow-page-head">
        <span className="flow-logo">JC</span>
        <div><strong>Juniper Coffee</strong><small>How was your visit?</small></div>
      </div>
      <Stars start={0.3} />
      <p className="flow-label">What stood out?</p>
      <div className="flow-tags">
        {TAGS.map((tag) => (
          <span key={tag.label} className={tag.at ? "flow-tag is-picked" : "flow-tag"} style={tag.at ? at(tag.at) : undefined}>
            <Check size={11} />{tag.label}
          </span>
        ))}
      </div>
      <div className="flow-draft m-up" style={at(2.8)}>
        <span className="flow-draft-label"><Sparkles size={12} /> Drafted from your choices</span>
        <p><Words text="Friendly staff, great coffee and the pastries tasted fresh out of the oven. Our new favorite spot!" start={3.1} /></p>
      </div>
      <span className="flow-button m-press" style={at(5.3)}><Copy size={14} /> Copy &amp; go to Google</span>
    </div>
  );
}

export function FlowReplyScene() {
  return (
    <div className="flow-scene flow-scene--reply">
      <p className="flow-google">
        <Image src={getBrandLogoUrl("google.com")} alt="" width={16} height={16} unoptimized />
        Google reviews
      </p>
      <div className="flow-review m-up" style={at(0.2)}>
        <div className="flow-review-head">
          <span className="flow-avatar">JM</span>
          <div><strong>Jordan M.</strong><small>Just now</small></div>
        </div>
        <span className="flow-stars is-static">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="currentColor" />)}</span>
        <p>Friendly staff, great coffee and the pastries tasted fresh out of the oven. Our new favorite spot!</p>
      </div>
      <div className="flow-reply m-up" style={at(1.1)}>
        <span className="flow-draft-label"><Sparkles size={12} /> AI reply · Friendly tone</span>
        <span className="m-typing" style={at(1.2)} aria-hidden="true"><i /><i /><i /></span>
        <p><Words text="Thank you, Jordan! We'll tell the team you said hi. See you soon for another round of pastries." start={2.1} /></p>
        <span className="flow-published m-pop" style={at(4.6)}><Check size={12} /> Published to Google</span>
      </div>
    </div>
  );
}
