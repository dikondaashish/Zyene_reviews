"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageSquare, Star } from "lucide-react";

export function RequestDemo() {
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  return (
    <div className="request-demo">
      <div className="request-demo-copy">
        <span className="tour-overline">THE NEXT REVIEW STARTS HERE</span>
        <h2>
          A little nudge.
          <br />A lasting impression.
        </h2>
        <p>Reach customers after their visit, with a personal invitation to share their experience.</p>
        <div className="tour-channel" aria-label="Example request channel">
          {(["sms", "email"] as const).map((value) => (
            <button type="button" key={value} aria-pressed={channel === value} onClick={() => setChannel(value)}>
              {value === "sms" ? <MessageSquare size={16} /> : <Mail size={16} />}
              {value === "sms" ? "Text message" : "Email"}
            </button>
          ))}
        </div>
        <Link href="/features/review-collection">
          Explore review collection <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="request-example" aria-live="polite">
        <div className="request-example-top">
          {channel === "sms" ? "Messages" : "Your inbox"}
          <span>Sample request</span>
        </div>
        <div className="request-avatar">J</div>
        <strong>Juniper Coffee</strong>
        <span className="request-time">{channel === "sms" ? "Today, 10:24 AM" : "How was your visit, Jordan?"}</span>
        <p>
          Hi Jordan! Thanks for stopping by Juniper Coffee. We’d love to hear about your experience. Would you share a quick
          review?
        </p>
        <div className="request-example-link">
          <div>
            <Star size={16} />
            <Star size={16} />
            <Star size={16} />
            <Star size={16} />
            <Star size={16} />
          </div>
          <strong>Your experience matters</strong>
          <span>A personal review link for every customer.</span>
        </div>
      </div>
    </div>
  );
}
