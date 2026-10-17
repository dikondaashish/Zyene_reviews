import { ArrowUpRight, BellRing, Hash, RefreshCw, Sparkles, Star } from "lucide-react";
import { MockBar, MockCaption, MockPill, MockStat, MockWindow, OverlayCard } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const BOARD = [
  { name: "Eastgate Auto Care", rating: 4.8, reviews: 612, you: false },
  { name: "Northside Auto", rating: 4.7, reviews: 438, you: true },
  { name: "Riverside Motors", rating: 4.4, reviews: 905, you: false },
  { name: "Main Street Tire & Brake", rating: 4.1, reviews: 271, you: false },
];

/** Rating comparison board for you and three tracked competitors, with a threshold alert floating over it. */
export function CompetitorHeroVisual() {
  return (
    <div className="vz-ct-hero">
      <MockWindow title="Competitors · Last 30 days" className="vz-ct-window">
        <div className="vz-ct-board-head">
          <span className="mk-label">Rating Comparison</span>
          <MockPill icon={RefreshCw}>Sync from Google</MockPill>
        </div>
        <div className="vz-ct-board">
          {BOARD.map((row, i) => (
            <div key={row.name} className={`vz-ct-board-row${row.you ? " is-you" : ""}`}>
              <span className="vz-ct-rank">#{i + 1}</span>
              <div className="vz-ct-board-name">
                <b>{row.name}{row.you && <MockPill tone="brand">You</MockPill>}</b>
                <span className="vz-ct-track"><i style={{ width: `${Math.round(((row.rating - 3.5) / 1.5) * 100)}%` }} /></span>
              </div>
              <div className="vz-ct-board-val">
                <b><Star size={12} />{row.rating.toFixed(1)}</b>
                <small>{row.reviews} reviews</small>
              </div>
            </div>
          ))}
        </div>
      </MockWindow>
      <div className="vz-ct-float">
        <OverlayCard icon={BellRing} title="Eastgate Auto Care review spike alert" text="Review volume increased by 24 (threshold 20)" tone="caution" />
      </div>
    </div>
  );
}

const TERMS = [
  { term: "auto repair near me", value: "2,140" },
  { term: "brake repair", value: "880" },
  { term: "oil change", value: "760" },
  { term: "northside auto", value: "410" },
];

/** The AI market positioning brief beside your Google search terms. */
export function CompetitorBriefVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-ct-brief">
        <div className="vz-ct-doc" aria-hidden="true">
          <div className="vz-ct-doc-head">
            <b>AI market positioning brief</b>
            <MockPill tone="brand" icon={Sparkles}>Regenerate brief</MockPill>
          </div>
          <h4>Strong on rating, quiet on volume</h4>
          <p>Northside Auto is rated above most nearby shops but collects fewer new reviews than Riverside Motors and Eastgate.</p>
          <ul>
            <li>Second-highest rating among tracked shops</li>
            <li>Brake repair searches are frequent; no competitor leads on it</li>
          </ul>
          <span className="mk-label">Suggested moves</span>
          <div className="vz-ct-move">
            <b>Ask every brake customer for a review</b>
            <small>More recent reviews would close the volume gap.</small>
          </div>
        </div>
        <div className="vz-ct-terms" aria-hidden="true">
          <span className="mk-label"><Hash size={11} /> Your Google search terms</span>
          {TERMS.map((t) => (
            <div key={t.term} className="vz-ct-term">
              <b>{t.term}</b>
              <small>{t.value} imp.</small>
            </div>
          ))}
        </div>
      </div>
      <MockCaption>Built from public listing data and your search terms.</MockCaption>
    </div>
  );
}

/** Market Benchmark tiles plus Market Movement bars for the selected period. */
export function CompetitorBenchmarkVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Competitors · Market Benchmark (90 days)">
        <div className="mk-grid-3">
          <MockStat label="Your rank" value="#2 / 4" />
          <MockStat label="You vs market" value="+0.2" />
          <MockStat label="Avg competitor review gain" value="+31" />
        </div>
        <span className="mk-label">Market Movement · review change</span>
        <div className="mk-stack">
          <MockBar label="Riverside Motors" value={100} tone="muted" caption="+58" />
          <MockBar label="Eastgate Auto Care" value={62} tone="muted" caption="+36" />
          <MockBar label="Northside Auto (you)" value={45} caption="+26" />
          <MockBar label="Main Street Tire & Brake" value={14} tone="muted" caption="+8" />
        </div>
        <div className="vz-ct-event">
          <ArrowUpRight size={14} />
          <span><b>Riverside Motors rating changed</b> · moved by +0.1 to 4.4</span>
        </div>
      </MockWindow>
    </div>
  );
}
