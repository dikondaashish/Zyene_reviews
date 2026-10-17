import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { MockCaption, MockStars, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const REVIEWS = [
  { name: "Dana R.", text: "Best color I have ever had. Tasha listened and nailed it.", when: "2 days ago" },
  { name: "Marcus L.", text: "Friendly team, on time, and a great cut for the price.", when: "1 week ago" },
  { name: "Priya S.", text: "Warm, relaxed salon. I booked my next visit on the spot.", when: "2 weeks ago" },
];

/** A client's website with an embedded review carousel and a floating badge. */
export function ReviewWidgetsHeroVisual() {
  return (
    <div className="vz-wg-hero">
      <MockWindow title="shinehairstudio.com">
        <div className="vz-wg-site">
          <b>Shine Hair Studio</b>
          <span>Services</span><span>Team</span><span>Book</span>
        </div>
        <div className="vz-wg-lines"><i /><i /></div>
        <div className="vz-wg-widget">
          <div className="vz-wg-widget-head">
            <span className="vz-wg-g">G</span>
            <div><b>Google reviews</b><small>4.9 · 128 reviews</small></div>
            <MockStars value={5} size={13} />
            <span className="vz-wg-write">Write a review</span>
          </div>
          <div className="vz-wg-cards">
            {REVIEWS.map((r) => (
              <div key={r.name} className="vz-wg-card">
                <div className="vz-wg-card-head"><span className="vz-wg-avatar">{r.name[0]}</span><b>{r.name}</b></div>
                <MockStars value={5} size={11} />
                <p>{r.text}</p>
                <small>{r.when}</small>
              </div>
            ))}
          </div>
          <div className="vz-wg-nav">
            <ChevronLeft size={14} /><span className="vz-wg-dots"><i className="is-on" /><i /><i /></span><ChevronRight size={14} />
          </div>
        </div>
      </MockWindow>
      <div className="vz-wg-badge" aria-hidden="true">
        <span className="vz-wg-g">G</span>
        <div><b>4.9</b><MockStars value={5} size={11} /><small>Excellent</small></div>
      </div>
    </div>
  );
}

type Kind = "carousel" | "badge" | "grid" | "slider" | "sticker" | "list" | "wall" | "side";

const TEMPLATES: [string, Kind, boolean?][] = [
  ["Carousel Widget", "carousel"], ["Badge", "badge"], ["Grid with AI Summary", "grid"], ["Simple Carousel", "carousel"],
  ["Slider", "slider"], ["Floating Badge", "badge"], ["Carousel with AI Summary", "carousel"], ["Carousel with Photos", "carousel"],
  ["Light Sticker", "sticker"], ["Tag Sticker", "sticker"], ["Achievement Sticker", "sticker"], ["Floating Achievement", "sticker"],
  ["Dark Carousel", "carousel", true], ["List", "list"], ["Review Wall", "wall"], ["Dark Grid with AI Summary", "grid", true],
  ["Sidebar Widget", "side"], ["Dark Floating Badge", "badge", true], ["Halloween Google Reviews", "carousel", true],
  ["Halloween Google Reviews Badge", "badge", true],
];

/** All 20 starting templates in the builder. */
export function ReviewWidgetsGalleryVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Widget builder · Templates">
        <span className="mk-label"><Sparkles size={11} /> Select a template to start with</span>
        <div className="vz-wg-gallery">
          {TEMPLATES.map(([name, kind, dark], i) => (
            <div key={name} className={`vz-wg-tile${i === 14 ? " is-picked" : ""}`}>
              <span className={`vz-wg-thumb vz-wg-thumb-${kind}${dark ? " is-dark" : ""}`}><i /><i /><i /></span>
              <small>{name}</small>
            </div>
          ))}
        </div>
      </MockWindow>
      <MockCaption>The 20 templates in the builder. Every one can be restyled.</MockCaption>
    </div>
  );
}
