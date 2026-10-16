import { Check, Copy, MessageSquareHeart, Palette, Sparkles, Star, Tags, UserRound } from "lucide-react";
import { MockCaption, MockPhone, MockPill, MockStars, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

/** Two phones side by side: the tag step and the AI draft step of the public review page. */
export function ReviewPageHeroVisual() {
  return (
    <div className="vz-rp-hero">
      <MockPhone className="vz-rp-phone-back">
        <b className="vz-rp-biz">Corner Café</b>
        <span className="vz-rp-q">How was your experience?</span>
        <MockStars value={5} size={20} />
        <span className="mk-label">What did you like most?</span>
        <div className="mk-wrap">
          <MockPill tone="brand" icon={Check}>Friendly staff</MockPill>
          <MockPill tone="brand" icon={Check}>Great coffee</MockPill>
          <MockPill>Quick service</MockPill>
          <MockPill tone="brand" icon={Check}>Fresh pastries</MockPill>
          <MockPill>Cozy seating</MockPill>
        </div>
        <span className="mk-label">Who helped you?</span>
        <div className="mk-wrap">
          <MockPill tone="dark" icon={UserRound}>Maya</MockPill>
          <MockPill icon={UserRound}>Leo</MockPill>
        </div>
        <span className="mk-button">Continue</span>
      </MockPhone>
      <MockPhone className="vz-rp-phone-front">
        <span className="mk-pill mk-pill-brand"><Sparkles size={12} />Drafted from your choices</span>
        <div className="mk-bubble">
          Lovely morning at Corner Café. Maya was so friendly, the coffee was excellent and the pastries tasted fresh
          out of the oven. We’ll be back!
        </div>
        <small className="vz-rp-hint">Edit anything. Posting is always your choice.</small>
        <span className="mk-button"><Copy size={14} />Copy &amp; go to Google</span>
      </MockPhone>
    </div>
  );
}

const TABS = ["Rating", "Tags", "Review Site", "Feedback", "Success", "Branding"];

/** Settings → Public Profile, where owners customize the page. */
export function ReviewPageSettingsVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Settings · Public Profile">
        <div className="vz-rp-tabs">
          {TABS.map((tab, i) => (
            <span key={tab} className={i === 1 ? "is-active" : undefined}>{tab}</span>
          ))}
        </div>
        <div className="mk-grid-2">
          <div className="mk-stack">
            <span className="mk-label"><Tags size={11} /> Tags customers can pick</span>
            <div className="mk-wrap">
              <MockPill tone="brand">Friendly staff</MockPill>
              <MockPill tone="brand">Great coffee</MockPill>
              <MockPill tone="brand">Fresh pastries</MockPill>
              <MockPill>+ Add tag</MockPill>
            </div>
          </div>
          <div className="mk-stack">
            <span className="mk-label"><Palette size={11} /> Rating style</span>
            <div className="mk-wrap">
              <MockPill tone="dark">Stars</MockPill>
              <MockPill>Emoji</MockPill>
              <MockPill>Numbers</MockPill>
              <MockPill>Slider</MockPill>
            </div>
          </div>
        </div>
        <div className="mk-row">
          <span className="mk-row-icon"><Star size={15} /></span>
          <div className="mk-row-text"><b>Private feedback below</b><small>Ratings under this go to a private form</small></div>
          <MockPill tone="dark">4 stars</MockPill>
        </div>
      </MockWindow>
      <MockCaption>Sample settings. Each location has its own page.</MockCaption>
    </div>
  );
}

/** The private feedback step a lower rating sees. */
export function ReviewPagePrivateVisual() {
  return (
    <div className="mk-stack" style={{ justifyItems: "center" }}>
      <MockPhone>
        <b className="vz-rp-biz">Corner Café</b>
        <MockStars value={2} size={20} />
        <span className="vz-rp-q">Sorry about that. What went wrong?</span>
        <div className="mk-bubble">The line was long and my order came out cold.</div>
        <div className="mk-grid-2">
          <span className="mk-pill">Email (optional)</span>
          <span className="mk-pill">Phone (optional)</span>
        </div>
        <span className="mk-bubble mk-bubble-brand"><MessageSquareHeart size={14} /> Next coffee is on us. Show this at the counter.</span>
        <span className="mk-button">Send to the team</span>
      </MockPhone>
      <MockCaption>Example private feedback step with an optional offer.</MockCaption>
    </div>
  );
}
