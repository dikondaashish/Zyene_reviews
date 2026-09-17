"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import { ArrowRight, Mail, MessageSquare, Send, Sparkles, LoaderCircle } from "lucide-react";
import { DEMO_CUSTOMERS } from "@/lib/marketing/product-demo-data";
import { createRequestDemoState, getRequestMessage, requestDemoReducer } from "@/lib/marketing/product-demo";
import { RequestPreview } from "@/components/marketing/product-tour/request-preview";
import { useDemoTyping } from "@/components/marketing/product-tour/use-demo-typing";

export function RequestDemo() {
  const id = useId();
  const [{ channel, customer, message, sent, revision }, dispatch] = useReducer(requestDemoReducer, undefined, createRequestDemoState);
  const { preview, typing, start, cancel } = useDemoTyping();
  const [sending, setSending] = useState(false);
  const deliveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (deliveryTimer.current) clearTimeout(deliveryTimer.current); }, []);
  function send() {
    if (sending || sent || typing || !message.trim()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { dispatch({ type: "send" }); return; }
    setSending(true);
    deliveryTimer.current = setTimeout(() => { dispatch({ type: "send" }); setSending(false); }, 1000);
  }
  return (
    <div className="request-demo">
      <div className="tour-page-heading"><div><span className="tour-overline">THE NEXT REVIEW STARTS HERE</span><h3>Send a review request</h3></div><span className="tour-sample-badge">No real messages</span></div>
      <div className="tour-request-layout">
        <form className="tour-request-form" onSubmit={event => { event.preventDefault(); send(); }}>
          <p>Choose a sample customer. Make the invitation yours.</p>
          <fieldset className="tour-channel"><legend>1. Choose a channel</legend>{(["sms", "email"] as const).map(value => (
            <button type="button" key={value} disabled={sending} aria-pressed={channel === value} onClick={event => { dispatch({ type: "channel", channel: value }); start(getRequestMessage(customer, value), event.detail > 0); }}>{value === "sms" ? <MessageSquare size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}{value === "sms" ? "Text message" : "Email"}</button>
          ))}</fieldset>
          <label htmlFor={`${id}-customer`}>2. Sample customer</label>
          <select id={`${id}-customer`} disabled={sending} value={customer} onChange={event => { cancel(); dispatch({ type: "customer", customer: event.target.value }); }}>{DEMO_CUSTOMERS.map(name => <option key={name}>{name}</option>)}</select>
          <label htmlFor={`${id}-message`}>3. Personalize your message</label>
          <textarea id={`${id}-message`} rows={4} maxLength={600} required disabled={sending} aria-busy={typing} value={preview ?? message} onChange={event => { cancel(); dispatch({ type: "edit", message: event.target.value }); }} />
          <button type="button" className="tour-write-ai" disabled={sending} onClick={event => { const text = getRequestMessage(customer, channel); dispatch({ type: "edit", message: text }); start(text, event.detail > 0); }}><Sparkles size={14} aria-hidden="true" />Write with AI</button>
          <p className="tour-request-hint">A personal review link and opt-out are included in the preview.</p>
          <button type="submit" className="tour-action" disabled={!message.trim() || sent || sending || typing}>{sending ? <>Sending sample<LoaderCircle className="tour-sending-spinner" size={15} aria-hidden="true" /></> : sent ? <>Preview ready<ArrowRight size={16} aria-hidden="true" /></> : <>Send demo request<Send size={15} aria-hidden="true" /></>}</button>
          <p role="status" className="tour-action-notice">{typing ? "Composing your sample invitation…" : sending ? "Sending to the sample customer preview…" : sent ? "Demo request delivered to the preview. Open its review link to try a rating. Nothing was sent." : "This only updates the customer preview. No contact details needed."}</p>
        </form>
        <RequestPreview key={revision} channel={channel} message={preview ?? message} sent={sent} sending={sending} />
      </div>
    </div>
  );
}
