import type { ReactNode } from "react";
import { Bot, Check, Link2, MessageSquareText, X } from "lucide-react";
import {
  MockBar, MockCaption, MockPill, MockStat, MockWindow,
} from "@/components/marketing/feature-landing/visuals/mock-primitives";

type Answer = { engine: string; mentioned: boolean; text: ReactNode; source: string };

const ANSWERS: Answer[] = [
  {
    engine: "ChatGPT", mentioned: true, source: "Cited: cornercafe.com",
    text: <>For a cozy morning spot, <mark>Corner Café</mark> is known for fresh pastries and friendly staff.</>,
  },
  {
    engine: "Perplexity", mentioned: false, source: "Competitor named: Daily Grind",
    text: <>Popular picks include Daily Grind and Bean There, both praised for their espresso.</>,
  },
  {
    engine: "Gemini", mentioned: true, source: "Cited: Google reviews",
    text: <><mark>Corner Café</mark> and Daily Grind are both well reviewed for breakfast.</>,
  },
];

/** One tracked prompt with three engine answers fanned out beneath it. */
export function AiVisibilityHeroVisual() {
  return (
    <div className="vz-aeo-hero">
      <div className="vz-aeo-prompt">
        <span className="mk-label"><MessageSquareText size={11} /> Tracked prompt · Discovery</span>
        <b>“best coffee shop in Kansas City”</b>
        <div className="mk-wrap">
          <MockPill tone="positive">Active</MockPill>
          <MockPill>Kansas City</MockPill>
        </div>
      </div>
      <div className="vz-aeo-answers">
        {ANSWERS.map((a) => (
          <div key={a.engine} className="vz-aeo-answer">
            <div className="vz-aeo-answer-head">
              <span className="vz-aeo-engine"><Bot size={14} />{a.engine}</span>
              {a.mentioned
                ? <MockPill tone="positive" icon={Check}>Mentioned</MockPill>
                : <MockPill tone="caution" icon={X}>Not mentioned</MockPill>}
            </div>
            <p>{a.text}</p>
            <small><Link2 size={11} /> {a.source}</small>
          </div>
        ))}
      </div>
      <MockCaption>Example answers for a fictional café. Engine coverage depends on provider availability.</MockCaption>
    </div>
  );
}

/** Share of voice against tracked competitors, plus visibility per engine. */
export function AiVisibilityShareVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Share of voice · last 30 days">
        <small className="vz-aeo-sub">When AI answers mention you or a tracked competitor, how often it is you.</small>
        <MockBar label="Corner Café (you)" value={38} caption="38%" />
        <MockBar label="Daily Grind" value={34} tone="muted" caption="34%" />
        <MockBar label="Bean There" value={28} tone="muted" caption="28%" />
        <span className="mk-label">AI visibility by engine</span>
        <div className="mk-grid-3">
          <MockStat label="ChatGPT" value="67%" />
          <MockStat label="Perplexity" value="33%" />
          <MockStat label="Gemini" value="50%" />
        </div>
      </MockWindow>
      <MockCaption>Example data. Failed or refused answers are not counted against you.</MockCaption>
    </div>
  );
}
