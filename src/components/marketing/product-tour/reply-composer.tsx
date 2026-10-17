"use client";

import { useId, useState, type Dispatch } from "react";
import { ArrowUpRight, Check, Reply } from "lucide-react";
import type { DemoDraft, ReviewDemoAction } from "@/types/marketing-product-demo";
import { useDemoTyping } from "@/components/marketing/product-tour/use-demo-typing";

export function DemoReplyComposer({ draft, replies, dispatch }: { draft: DemoDraft; replies: Record<DemoDraft["tone"], string>; dispatch: Dispatch<ReviewDemoAction> }) {
  const id = useId();
  const [notice, setNotice] = useState("Choose a tone, edit the draft, then publish.");
  const saved = draft.published === draft.text.trim();
  const { preview, typing, start, cancel } = useDemoTyping();
  return (
    <div className="tour-composer">
      <div className="tour-composer-top"><strong><Reply size={16} aria-hidden="true" />A reply that sounds like you</strong><span>{typing ? "Writing your reply…" : "AI draft"}</span></div>
      <div className="tour-tones" aria-label="Reply tone">
        {(["friendly", "professional", "concise"] as const).map(tone => (
          <button type="button" key={tone} aria-pressed={draft.tone === tone} onClick={event => {
            dispatch({ type: "tone", tone });
            start(replies[tone], event.detail > 0);
            setNotice(`${tone[0].toUpperCase()}${tone.slice(1)} sample draft ready. You can edit it below.`);
          }}>{tone}</button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">Edit the reply</label>
      <textarea id={id} value={preview ?? draft.text} aria-busy={typing} rows={4} maxLength={1500} onChange={event => { cancel(); dispatch({ type: "edit", text: event.target.value }); setNotice("Draft saved."); }} />
      <div className="tour-composer-bottom">
        <span className="tour-character-count">{(preview ?? draft.text).length}/1,500</span>
        <button type="button" className="tour-action" disabled={typing || !draft.text.trim() || saved} onClick={() => { dispatch({ type: "publish" }); setNotice("Reply published."); }}>
          {saved ? <><Check size={16} aria-hidden="true" />Replied</> : <>{draft.published ? "Update reply" : "Publish reply"}<ArrowUpRight size={16} aria-hidden="true" /></>}
        </button>
      </div>
      <p className="tour-action-notice" role="status">{typing ? "AI is writing your reply. You can start editing at any time." : notice}</p>
    </div>
  );
}
