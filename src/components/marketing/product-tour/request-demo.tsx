"use client";

import { useId, useReducer } from "react";
import { ArrowRight, Mail, MessageSquare, Send } from "lucide-react";
import { DEMO_CUSTOMERS } from "@/lib/marketing/product-demo-data";
import { createRequestDemoState, requestDemoReducer } from "@/lib/marketing/product-demo";
import { RequestPreview } from "@/components/marketing/product-tour/request-preview";

export function RequestDemo() {
  const id = useId();
  const [{ channel, customer, message, sent, revision }, dispatch] = useReducer(requestDemoReducer, undefined, createRequestDemoState);
  return (
    <div className="request-demo">
      <div className="tour-page-heading"><div><span className="tour-overline">THE NEXT REVIEW STARTS HERE</span><h3>Send a review request</h3></div><span className="tour-sample-badge">No real messages</span></div>
      <div className="tour-request-layout">
        <form className="tour-request-form" onSubmit={event => { event.preventDefault(); dispatch({ type: "send" }); }}>
          <p>Choose a sample customer. Make the invitation yours.</p>
          <fieldset className="tour-channel"><legend>1. Choose a channel</legend>{(["sms", "email"] as const).map(value => (
            <button type="button" key={value} aria-pressed={channel === value} onClick={() => dispatch({ type: "channel", channel: value })}>{value === "sms" ? <MessageSquare size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}{value === "sms" ? "Text message" : "Email"}</button>
          ))}</fieldset>
          <label htmlFor={`${id}-customer`}>2. Sample customer</label>
          <select id={`${id}-customer`} value={customer} onChange={event => dispatch({ type: "customer", customer: event.target.value })}>{DEMO_CUSTOMERS.map(name => <option key={name}>{name}</option>)}</select>
          <label htmlFor={`${id}-message`}>3. Personalize your message</label>
          <textarea id={`${id}-message`} rows={5} maxLength={600} required value={message} onChange={event => dispatch({ type: "edit", message: event.target.value })} />
          <p className="tour-request-hint">A personal review link and opt-out are included in the preview.</p>
          <button type="submit" className="tour-action" disabled={!message.trim() || sent}>{sent ? <>Preview ready<ArrowRight size={16} aria-hidden="true" /></> : <>Send demo request<Send size={15} aria-hidden="true" /></>}</button>
          <p role="status" className="tour-action-notice">{sent ? "Demo request delivered to the preview. Open its review link to try a rating. Nothing was sent." : "This only updates the customer preview. No contact details needed."}</p>
        </form>
        <RequestPreview key={revision} channel={channel} message={message} sent={sent} />
      </div>
    </div>
  );
}
