"use client";

import { useId, useState, type Dispatch } from "react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { DemoDraft, ReviewDemoAction } from "@/types/marketing-product-demo";

export function DemoReplyComposer({ draft, dispatch }: { draft: DemoDraft; dispatch: Dispatch<ReviewDemoAction> }) {
  const id = useId();
  const [notice, setNotice] = useState("Choose a tone, edit the draft, then publish in the demo.");
  const saved = draft.published === draft.text.trim();
  return (
    <div className="tour-composer">
      <div className="tour-composer-top"><strong><Sparkles size={16} aria-hidden="true" />A reply that sounds like you</strong><span>Sample AI draft</span></div>
      <div className="tour-tones" aria-label="Example reply tone">
        {(["friendly", "professional", "concise"] as const).map(tone => (
          <button type="button" key={tone} aria-pressed={draft.tone === tone} onClick={() => {
            dispatch({ type: "tone", tone });
            setNotice(`${tone[0].toUpperCase()}${tone.slice(1)} sample draft ready. You can edit it below.`);
          }}>{tone}</button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">Edit the example reply</label>
      <textarea id={id} value={draft.text} rows={4} maxLength={1500} onChange={event => { dispatch({ type: "edit", text: event.target.value }); setNotice("Your draft is saved in this demo while you explore."); }} />
      <div className="tour-composer-bottom">
        <span className="tour-character-count">{draft.text.length}/1,500</span>
        <button type="button" className="tour-action" disabled={!draft.text.trim() || saved} onClick={() => { dispatch({ type: "publish" }); setNotice("Reply published in this demo only. Nothing was sent."); }}>
          {saved ? <><Check size={16} aria-hidden="true" />Replied in demo</> : <>{draft.published ? "Update demo reply" : "Publish in demo"}<ArrowUpRight size={16} aria-hidden="true" /></>}
        </button>
      </div>
      <p className="tour-action-notice" role="status">{notice}</p>
    </div>
  );
}
