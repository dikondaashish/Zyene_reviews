import { Check, Copy, Sparkles, Star } from "lucide-react";

const TAGS = [
  { label: "Friendly staff", selected: true },
  { label: "Great coffee", selected: true },
  { label: "Quick service", selected: false },
  { label: "Fresh pastries", selected: true },
  { label: "Cozy seating", selected: false },
];

/** Static mock of the public review page at the "AI draft" step. Fictional business. */
export function HomeJourneyPhone() {
  return (
    <figure className="home-journey-phone-wrap">
      <div className="home-journey-phone" aria-hidden="true">
        <div className="home-journey-phone-head">
          <span className="home-journey-phone-logo">CC</span>
          <div>
            <strong>Corner Café</strong>
            <small>How was your experience?</small>
          </div>
        </div>
        <div className="home-journey-phone-stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star key={value} size={22} fill="currentColor" />
          ))}
        </div>
        <p className="home-journey-phone-label">What did you like most?</p>
        <div className="home-journey-phone-tags">
          {TAGS.map((tag) => (
            <span key={tag.label} className={tag.selected ? "is-selected" : undefined}>
              {tag.selected && <Check size={12} />}
              {tag.label}
            </span>
          ))}
        </div>
        <div className="home-journey-phone-draft">
          <span className="home-journey-phone-draft-label">
            <Sparkles size={13} />
            Drafted from your choices · editable
          </span>
          <p>
            Lovely morning at Corner Café. The staff were so friendly, the coffee was excellent and the pastries tasted
            fresh out of the oven. We’ll be back soon!
          </p>
        </div>
        <span className="home-journey-phone-button">
          <Copy size={15} />
          Copy &amp; go to Google
        </span>
      </div>
      <figcaption>Example review page for a fictional café. You set the question, tags, colors and logo.</figcaption>
    </figure>
  );
}
