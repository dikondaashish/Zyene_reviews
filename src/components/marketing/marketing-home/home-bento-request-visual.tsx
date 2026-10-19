"use client";

import { useState } from "react";
import { at } from "@/components/marketing/marketing-home/home-motion-text";

type Channel = "text" | "email";

const TABS: { value: Channel; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

/** Sample request with fictional data. Switching channel remounts the preview so its entrance animation replays. */
export function BentoRequestVisual() {
  const [channel, setChannel] = useState<Channel>("text");
  return (
    <div className="bento-request">
      <div className="bento-segment" role="tablist" aria-label="Request channel">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`bento-request-tab-${value}`}
            aria-selected={channel === value}
            aria-controls="bento-request-panel"
            className={channel === value ? "is-active" : undefined}
            onClick={() => setChannel(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div key={channel} id="bento-request-panel" role="tabpanel" aria-labelledby={`bento-request-tab-${channel}`} className="bento-request-panel">
        <div className="bento-bubble-wrap">
          <span className="m-typing bento-typing" style={at(0.3)} aria-hidden="true"><i /><i /><i /></span>
          {channel === "text" ? (
            <p className="bento-bubble m-up" style={at(1.3)}>
              Hi Jordan, thanks for visiting Juniper Coffee today. Mind sharing how it went? It takes 30 seconds.
              <span>collectratings.com/r/juniper</span>
            </p>
          ) : (
            <div className="bento-email m-up" style={at(1.3)}>
              <small>Subject</small>
              <strong>Thanks for visiting Juniper Coffee</strong>
              <p>Hi Jordan, thanks for visiting today. Mind sharing how it went? It takes 30 seconds.</p>
              <span className="bento-email-cta">Leave a review</span>
            </div>
          )}
        </div>
        <small className="m-up" style={at(1.9)}>Reminder on day 7 if there&apos;s no reply</small>
      </div>
    </div>
  );
}
