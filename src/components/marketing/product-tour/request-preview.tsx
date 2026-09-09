"use client";

import { useState } from "react";
import { ArrowLeft, CheckCheck, Coffee } from "lucide-react";
import { DemoRatingPreview } from "@/components/marketing/product-tour/rating-preview";
import type { DemoChannel } from "@/types/marketing-product-demo";

export function RequestPreview({ channel, message, sent }: { channel: DemoChannel; message: string; sent: boolean }) {
  const [opened, setOpened] = useState(false);
  return (
    <div className="tour-preview-column">
      <p className="tour-preview-caption">Customer view · interactive preview</p>
      <div className="request-example">
        <div className="request-example-top"><span>{opened ? "Review example" : channel === "sms" ? "Messages" : "Inbox"}</span><span>{sent ? "Demo delivered" : "Draft preview"}</span></div>
        <div className="request-avatar"><Coffee size={24} aria-hidden="true" /></div>
        <strong>Juniper Coffee</strong>
        {!opened ? <>
          <span className="request-time">{channel === "sms" ? "Text message preview" : "Subject: How was your visit?"}</span>
          <p className="tour-message-bubble">{message || "Your message will appear here."}</p>
          <button type="button" className="request-example-link" disabled={!sent} onClick={() => setOpened(true)}>
            <span className="tour-stars" aria-hidden="true">★★★★★</span><strong>Share your experience</strong><span>{sent ? "Open your demo review link →" : "Send a demo request to try this link"}</span>
          </button>
          <p className="tour-opt-out">{channel === "sms" ? "Reply STOP to opt out." : "Unsubscribe from review invitations."}</p>
          {sent && <span className="tour-demo-delivered"><CheckCheck size={14} aria-hidden="true" />Delivered in demo only</span>}
        </> : <DemoRatingPreview />}
        {opened && <button type="button" className="tour-preview-back" onClick={() => setOpened(false)}><ArrowLeft size={14} aria-hidden="true" />Back to message</button>}
      </div>
    </div>
  );
}
