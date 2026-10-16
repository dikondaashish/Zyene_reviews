import { AlertTriangle, CheckCircle2, ChevronRight, Lightbulb, Link2, Quote, Zap } from "lucide-react";
import { MockCaption, MockPill, MockRow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const THEMES = [
  { name: "Friendly baristas", mentions: 31, tone: "positive" },
  { name: "Seasonal lattes", mentions: 22, tone: "positive" },
  { name: "Weekend wait times", mentions: 14, tone: "negative" },
  { name: "Seating space", mentions: 9, tone: "neutral" },
] as const;

/** The Smart Insights dashboard card: two-part headline, theme list and the selected theme's quotes. */
export function SmartInsightsHeroVisual() {
  return (
    <div className="vz-si-hero">
      <div className="vz-si-card" aria-hidden="true">
        <div className="mk-wrap">
          <MockPill tone="brand">Smart insights</MockPill>
          <span className="vz-si-muted">186 reviews analyzed</span>
        </div>
        <p className="vz-si-headline">
          Guests love your baristas.
          <span>Weekend waits, not so much.</span>
        </p>
        <div className="vz-si-tabs">
          <span className="is-active">Key themes</span>
          <span>Suggestions</span>
        </div>
        <div className="vz-si-themes">
          {THEMES.map((theme, i) => (
            <div key={theme.name} className={`vz-si-theme${i === 2 ? " is-active" : ""}`}>
              <i className={`vz-si-dot vz-si-dot-${theme.tone}`} />
              <b>{theme.name}</b>
              <small>{theme.mentions} mentions</small>
            </div>
          ))}
        </div>
      </div>
      <div className="vz-si-quote" aria-hidden="true">
        <span className="mk-label"><Quote size={11} /> Weekend wait times · Negative</span>
        <p>“Guests say the coffee is worth it, but Saturday mornings mean a 20-minute line.”</p>
        <div className="mk-bubble">“Waited forever on Saturday, but the oat latte was perfect.”</div>
        <div className="mk-bubble">“Great staff. Just need more hands at the weekend.”</div>
      </div>
      <MockCaption>Example insights for a fictional café.</MockCaption>
    </div>
  );
}

const SUGGESTIONS = [
  { title: "Add a second barista on Saturday mornings", urgency: "Act now", effort: "Low", impact: "+0.2 avg stars" },
  { title: "Name your seasonal latte on the menu board", urgency: "When you can", effort: "Low", impact: "+5% mentions" },
  { title: "Add two small tables by the window", urgency: "When you can", effort: "Medium", impact: "+0.1 avg stars" },
];

/** Suggestions tab: a fanned stack of suggestion cards with their tags. */
export function SmartInsightsSuggestionsVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-si-stack">
        {SUGGESTIONS.map((s, i) => (
          <div key={s.title} className={`vz-si-sugg vz-si-sugg-${i}`} aria-hidden="true">
            <div className="vz-si-sugg-head">
              <span className="vz-si-sugg-icon">{i === 0 ? <Zap size={15} /> : <Lightbulb size={15} />}</span>
              <b>{s.title}</b>
              <ChevronRight size={15} />
            </div>
            <div className="mk-wrap">
              <MockPill tone={s.urgency === "Act now" ? "brand" : "neutral"}>{s.urgency}</MockPill>
              <MockPill>Effort: {s.effort}</MockPill>
              <MockPill tone="dark">{s.impact}</MockPill>
            </div>
            {i === 0 && (
              <div className="mk-wrap">
                <span className="mk-button">See examples</span>
                <span className="mk-button mk-button-ghost">Dismiss</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <MockCaption>Example suggestions. Impact labels are AI estimates, not forecasts.</MockCaption>
    </div>
  );
}

/** Google profile action links after a sync, next to the dashboard tile that counts the broken ones. */
export function SmartInsightsLinksVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-si-links">
        <div className="vz-si-panel" aria-hidden="true">
          <span className="mk-label"><Link2 size={11} /> Google profile links · last sync</span>
          <MockRow icon={CheckCircle2} title="Order online" meta="cornercafe.example/order" trailing={<MockPill tone="positive">OK</MockPill>} />
          <MockRow icon={AlertTriangle} title="Reserve a table" meta="old-booking.example/corner" trailing={<MockPill tone="caution">Failed</MockPill>} />
          <MockRow icon={CheckCircle2} title="Order delivery" meta="cornercafe.example/delivery" trailing={<MockPill tone="positive">OK</MockPill>} />
        </div>
        <div className="vz-si-tile" aria-hidden="true">
          <span className="vz-si-muted">Broken place links</span>
          <strong>1</strong>
          <small>URLs that failed a quick availability check</small>
          <span className="mk-button mk-button-ghost"><Link2 size={14} />Manage links</span>
        </div>
      </div>
      <MockCaption>Example links for a fictional café.</MockCaption>
    </div>
  );
}
