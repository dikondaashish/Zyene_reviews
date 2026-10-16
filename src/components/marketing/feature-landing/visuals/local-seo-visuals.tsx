import {
  ArrowDown, CalendarDays, Camera, Link2, MessageSquareReply, Sparkles,
} from "lucide-react";
import {
  MockCaption, MockPill, MockRow, MockStat, MockWindow, OverlayCard,
} from "@/components/marketing/feature-landing/visuals/mock-primitives";

/** Profile score dial, the "What to fix" list and a broken-link alert floating over it. */
export function LocalSeoHeroVisual() {
  return (
    <div className="vz-seo-hero">
      <MockWindow title="Google SEO & AI visibility">
        <div className="vz-seo-score">
          <div className="vz-seo-dial" style={{ background: "conic-gradient(var(--brand-orange) 73%, var(--muted) 0)" }}>
            <span><b>73</b><small>/100</small></span>
          </div>
          <div className="vz-seo-score-text">
            <b>Corner Café</b>
            <small>8 of 11 measured checks on track</small>
            <MockPill tone="caution">3 open</MockPill>
          </div>
        </div>
        <span className="mk-label">What to fix</span>
        <MockRow icon={MessageSquareReply} title="Review Replies (30d)" meta="62% replied (13/21)" trailing={<MockPill tone="caution">Fix</MockPill>} />
        <MockRow icon={CalendarDays} title="Post Frequency" meta="No recent Google posts" trailing={<MockPill tone="caution">Fix</MockPill>} />
        <MockRow icon={Camera} title="Photos" meta="Add newer photos to your profile" trailing={<MockPill tone="caution">Fix</MockPill>} />
        <div className="vz-seo-more"><span>On track (8)</span><span>Show</span></div>
      </MockWindow>
      <div className="vz-seo-float">
        <OverlayCard icon={Link2} title="1 broken link" text="Your reservations link returns an error" tone="caution" />
      </div>
      <MockCaption>Example score for a fictional café.</MockCaption>
    </div>
  );
}

const SPARK = [38, 46, 41, 55, 52, 60, 58, 66, 61, 72, 69, 78];
const TERMS: [string, string][] = [
  ["coffee near me", "1,240"],
  ["cafe kansas city", "610"],
  ["corner cafe", "380"],
  ["breakfast near me", "295"],
];

/** Search & Maps performance plus the search terms that showed the profile. */
export function LocalSeoSearchVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Google performance · last 30 days">
        <div className="vz-seo-spark" aria-hidden="true">
          {SPARK.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
        </div>
        <div className="mk-grid-2">
          <MockStat label="Profile views" value="8,420" />
          <MockStat label="Website clicks" value="312" />
          <MockStat label="Calls" value="96" />
          <MockStat label="Directions" value="241" />
        </div>
        <div className="vz-seo-terms">
          <span className="mk-label">Your Google search terms</span>
          <small>71% discovery vs 29% name/brand</small>
          {TERMS.map(([term, imp]) => (
            <div key={term} className="vz-seo-term"><b>{term}</b><span>{imp} imp.</span></div>
          ))}
        </div>
      </MockWindow>
      <MockCaption>Example data. Impressions show how often you appeared, not your rank.</MockCaption>
    </div>
  );
}

/** Before/after description draft and a Google post waiting for approval. */
export function LocalSeoContentVisual() {
  return (
    <div className="vz-seo-content">
      <div className="vz-seo-card">
        <span className="mk-label">Current description</span>
        <p className="mk-bubble">Coffee shop on Main Street. Open daily.</p>
      </div>
      <span className="vz-seo-arrow"><ArrowDown size={16} /></span>
      <div className="vz-seo-card vz-seo-card-new">
        <span className="mk-pill mk-pill-brand"><Sparkles size={12} />Suggested with your search terms</span>
        <p className="mk-bubble mk-bubble-brand">
          Corner Café is a neighborhood <mark>coffee</mark> shop in <mark>Kansas City</mark> serving espresso,
          fresh pastries and a cozy <mark>breakfast</mark> menu every day.
        </p>
        <div className="mk-grid-2">
          <span className="mk-button mk-button-ghost">Apply suggestion</span>
          <span className="mk-button">Save to Google</span>
        </div>
      </div>
      <div className="vz-seo-card">
        <span className="mk-label">Google post draft</span>
        <p className="vz-seo-post">Fall menu is here: pumpkin spice lattes and apple hand pies, every morning from 7.</p>
        <span className="mk-button mk-button-ghost">Publish to Google</span>
      </div>
      <MockCaption>Drafts for a fictional café. Nothing is published until you click.</MockCaption>
    </div>
  );
}
