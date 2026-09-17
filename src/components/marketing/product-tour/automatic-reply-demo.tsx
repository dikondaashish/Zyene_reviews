"use client";

import { useId } from "react";
import { Bot, CheckCheck, RotateCcw } from "lucide-react";
import { useAutoReplyDemo } from "@/components/marketing/product-tour/use-auto-reply-demo";
import type { DemoAutoRating } from "@/types/marketing-product-demo";

export function AutomaticReplyDemo() {
  const id = useId();
  const { settings, result, preview, configure, simulate, toggle } = useAutoReplyDemo();
  const status = !settings.enabled ? "Automatic replies are off in this demo."
    : !result ? "Settings ready. Preview a new review to try them."
      : result.status === "typing" ? "AI is writing a sample reply…"
        : result.status === "skipped" ? "Skipped · below your rating threshold" : "Published in demo only";
  return (
    <section className="tour-auto" aria-label="Automatic reply demo">
      <div className="tour-auto-heading">
        <Bot size={20} aria-hidden="true" />
        <div><label htmlFor={`${id}-enabled`}>Try automatic replies</label><p id={`${id}-explanation`}>Choose your settings, then watch a new Google review receive a reply.</p></div>
        <button id={`${id}-enabled`} type="button" className="tour-auto-switch" role="switch" aria-checked={settings.enabled} aria-label="Try automatic replies" aria-describedby={`${id}-explanation ${id}-disclosure`} onClick={event => toggle(event.detail > 0)}><span /></button>
      </div>
      <div className="tour-auto-settings">
        <div><label htmlFor={`${id}-threshold`}>Reviews to reply to</label><select id={`${id}-threshold`} value={settings.minRating} onChange={event => configure({ minRating: Number(event.target.value) as DemoAutoRating })}>{([3, 4, 5] as const).map(rating => <option key={rating} value={rating}>{rating} stars {rating === 5 ? "only" : "and up"}</option>)}</select></div>
        <fieldset><legend>Reply tone</legend><div className="tour-auto-tones">{(["professional", "friendly", "concise"] as const).map(tone => <button key={tone} type="button" aria-pressed={settings.tone === tone} aria-label={`Use ${tone[0].toUpperCase()}${tone.slice(1)} for automatic replies`} onClick={() => configure({ tone })}>{tone}</button>)}</div></fieldset>
      </div>
      <div className="tour-auto-simulate">
        <div><label htmlFor={`${id}-rating`}>Sample review rating</label><select id={`${id}-rating`} value={settings.rating} onChange={event => configure({ rating: Number(event.target.value) as DemoAutoRating })}>{[3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} stars</option>)}</select></div>
        <button className="tour-auto-preview" type="button" disabled={!settings.enabled || result?.status === "typing"} onClick={event => simulate(settings, event.detail > 0)}><RotateCcw size={13} aria-hidden="true" />Preview a new review</button>
      </div>
      {result && <div className="tour-auto-result" aria-busy={result.status === "typing"}>
        <div><strong>Taylor S.</strong><span>New sample · Google · {result.rating} stars</span></div>
        <p>{result.review}</p>
        {result.status !== "skipped" && <p className="tour-auto-reply">{preview ?? result.reply}<span className="tour-auto-caret" hidden={result.status !== "typing"} aria-hidden="true" /></p>}
      </div>}
      <p className="tour-auto-status" role="status">{result?.status === "published" && <CheckCheck size={14} aria-hidden="true" />}{status}</p>
      <p id={`${id}-disclosure`} className="tour-auto-disclosure">Local simulation. Nothing is published to Google. Existing inbox reviews stay unchanged.</p>
    </section>
  );
}
