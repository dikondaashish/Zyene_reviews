import { Play, Wallet } from "lucide-react";
import { MockCaption, MockPill, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const PROMPTS: { text: string; intent: string; active: boolean }[] = [
  { text: "best coffee shop in Kansas City", intent: "Discovery", active: true },
  { text: "Corner Café vs Daily Grind", intent: "Comparison", active: true },
  { text: "is Corner Café any good", intent: "Branded", active: false },
];

/** Prompt library beside the balance and manual run panel. */
export function AiVisibilityLibraryVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Google SEO & AEO · Prompts">
        <div className="vz-aeo-library">
          <div className="mk-stack">
            <span className="mk-label">Prompts · 2 of 3 active</span>
            {PROMPTS.map((p) => (
              <div key={p.text} className="vz-aeo-row">
                <div>
                  <b>{p.text}</b>
                  <small>{p.intent}</small>
                </div>
                <span className={`vz-aeo-toggle${p.active ? " is-on" : ""}`} />
              </div>
            ))}
            <span className="mk-pill">+ Suggest prompts</span>
          </div>
          <div className="vz-aeo-wallet">
            <span className="mk-label"><Wallet size={11} /> Balance</span>
            <strong>$5.00</strong>
            <small>Each successful answer is one $2.50 test.</small>
            <div className="mk-wrap">
              <MockPill>1</MockPill>
              <MockPill tone="dark">3 observations</MockPill>
              <MockPill>5</MockPill>
            </div>
            <span className="mk-button"><Play size={14} />Run now</span>
          </div>
        </div>
      </MockWindow>
      <MockCaption>Example prompt library for a fictional café.</MockCaption>
    </div>
  );
}
