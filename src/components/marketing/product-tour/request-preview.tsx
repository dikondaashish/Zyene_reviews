"use client";

import { useState } from "react";
import { ArrowLeft, Coffee } from "lucide-react";
import { DemoRatingPreview } from "@/components/marketing/product-tour/rating-preview";
import { RequestMessage } from "@/components/marketing/product-tour/request-message";
import type { DemoChannel } from "@/types/marketing-product-demo";

export function RequestPreview({ channel, message, sent, sending = false }: { channel: DemoChannel; message: string; sent: boolean; sending?: boolean }) {
  const [opened, setOpened] = useState(false);
  return (
    <div className="tour-preview-column">
      <p className="tour-preview-caption">Customer view · interactive preview</p>
      <div className="request-example" data-delivery={sending ? "sending" : sent ? "delivered" : "draft"}>
        <div className="request-example-top"><span>{opened ? "Review example" : channel === "sms" ? "Messages" : "Inbox"}</span><span>{sent ? "Demo delivered" : "Draft preview"}</span></div>
        <div className="request-avatar"><Coffee size={24} aria-hidden="true" /></div>
        <strong>Juniper Coffee</strong>
        {opened ? <DemoRatingPreview /> : <RequestMessage channel={channel} message={message} sent={sent} sending={sending} onOpen={() => setOpened(true)} />}
        {opened && <button type="button" className="tour-preview-back" onClick={() => setOpened(false)}><ArrowLeft size={14} aria-hidden="true" />Back to message</button>}
      </div>
    </div>
  );
}
