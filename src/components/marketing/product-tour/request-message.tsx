import { CheckCheck } from "lucide-react";
import type { DemoChannel } from "@/types/marketing-product-demo";

export function RequestMessage({ channel, message, sent, sending, onOpen }: {
  channel: DemoChannel; message: string; sent: boolean; sending: boolean; onOpen: () => void;
}) {
  return <>
    <span className="request-time">{channel === "sms" ? "Text message preview" : "Subject: How was your visit?"}</span>
    <p className="tour-message-bubble">{sending ? <span className="tour-typing-dots" aria-label="Sample message on its way"><i /><i /><i /></span> : message || "Your message will appear here."}</p>
    <button type="button" className="request-example-link" disabled={!sent} onClick={onOpen}>
      <span className="tour-stars" aria-hidden="true">★★★★★</span><strong>Share your experience</strong><span>{sent ? "Open your demo review link →" : "Send a demo request to try this link"}</span>
    </button>
    <p className="tour-opt-out">{channel === "sms" ? "Reply STOP to opt out." : "Unsubscribe from review invitations."}</p>
    {sent && <span className="tour-demo-delivered"><CheckCheck size={14} aria-hidden="true" />Delivered in demo only</span>}
  </>;
}
