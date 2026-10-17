import { CalendarClock, Mail, MessageSquare, MousePointerClick, Search, Send, Star } from "lucide-react";
import { MockBar, MockPhone, MockPill, MockRow, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const SMS_TEXT =
  "Hi Linda! Thanks for visiting Willow Hair Studio. We’d love your feedback - it only takes 30 seconds: collectratings.com/willow-hair-studio";

/** The Send Review Request dialog with a contact search, and the text it sends landing on a phone. */
export function RequestsHeroVisual() {
  return (
    <div className="vz-rq-hero">
      <MockWindow title="Requests · Send Review Request" className="vz-rq-window">
        <span className="mk-label">Channel</span>
        <div className="vz-rq-seg">
          <span>SMS</span>
          <span>Email</span>
          <span className="is-active">Both</span>
        </div>
        <div className="vz-rq-field">
          <small>Customer name</small>
          <span className="vz-rq-input"><Search size={13} />Lin<i className="vz-rq-caret" /></span>
          <div className="vz-rq-suggest">
            <span><b>Linda Okafor</b><small>(555) 201-7788 · linda@example.com</small></span>
            <span><b>Lindsay Park</b><small>(555) 344-0192</small></span>
          </div>
        </div>
        <div className="vz-rq-switch">
          <div><b>Schedule for later</b><small>Queues the request for the time you pick.</small></div>
          <i aria-hidden="true" />
        </div>
        <span className="mk-button">Preview request</span>
      </MockWindow>
      <MockPhone className="vz-rq-phone">
        <span className="vz-rq-sender"><MessageSquare size={12} />Text message · now</span>
        <div className="mk-bubble">{SMS_TEXT}</div>
        <small className="vz-rq-stop">Reply STOP to opt out.</small>
      </MockPhone>
    </div>
  );
}

/** The preview step: exact SMS and email, recipient, schedule and remaining allowance. */
export function RequestsPreviewVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Send Review Request · Preview">
        <div className="vz-rq-preview-head">
          <b>Review request for Willow Hair Studio</b>
          <small>To Linda Okafor: (555) 201-7788 · linda@example.com</small>
          <MockPill tone="brand" icon={CalendarClock}>Scheduled: Fri, 10:00 AM (your timezone)</MockPill>
        </div>
        <div className="vz-rq-msg">
          <span className="mk-label"><MessageSquare size={11} /> SMS message</span>
          <p>{SMS_TEXT}{"\n"}Reply STOP to opt out.</p>
          <small>1 SMS request · 412 remaining this month</small>
        </div>
        <div className="vz-rq-msg">
          <span className="mk-label"><Mail size={11} /> Email: Thanks for stopping by Willow Hair Studio</span>
          <p>Hi Linda, hope you had a good visit to Willow Hair Studio. If you have a minute, we’d love to hear how it went.</p>
          <small>1 email request · 388 remaining this month</small>
        </div>
        <div className="vz-rq-actions">
          <span className="mk-button mk-button-ghost">Back to edit</span>
          <span className="mk-button">Confirm schedule</span>
        </div>
      </MockWindow>
    </div>
  );
}

const FUNNEL = [
  { label: "Sent", value: 100, caption: "120" },
  { label: "Delivered", value: 96, caption: "116" },
  { label: "Opened", value: 62, caption: "74" },
  { label: "Link clicked", value: 43, caption: "52" },
  { label: "Completed", value: 26, caption: "31" },
  { label: "Google handoff", value: 20, caption: "24" },
];

/** Request list with statuses, plus the Analytics funnel floating beside it. */
export function RequestsTrackingVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-rq-track">
        <MockWindow title="Requests" className="vz-rq-list">
          <MockRow icon={Star} title="Linda Okafor" meta="SMS + Email · 2 days ago" trailing={<MockPill tone="positive">Review Left</MockPill>} />
          <MockRow icon={MousePointerClick} title="Marcus Webb" meta="SMS · yesterday" trailing={<MockPill tone="brand">Clicked</MockPill>} />
          <MockRow icon={Send} title="Priya Nair" meta="Email · today" trailing={<MockPill>Delivered</MockPill>} />
          <MockRow icon={CalendarClock} title="Tom Alvarez" meta="SMS · Fri 10:00 AM" trailing={<MockPill>Queued</MockPill>} />
        </MockWindow>
        <div className="vz-rq-funnel">
          <span className="mk-label">Request funnel</span>
          {FUNNEL.map((step) => (
            <MockBar
              key={step.label}
              label={step.label}
              value={step.value}
              caption={step.caption}
              tone={step.label === "Google handoff" ? "positive" : "brand"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
