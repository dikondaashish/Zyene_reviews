import { ArrowRight, Calendar, Check, Mail, MessageSquare, Repeat, Timer, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MockCaption, MockPill, MockStat, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const STEPS = ["Basics", "Message", "Timing", "Review & Launch"];
const DELAYS = ["Immediately", "1 hour", "2 hours", "4 hours", "1 day"];

/** The campaign builder on its Timing step: stepper, send delay and the day 7 / day 14 reminder drip. */
export function CampaignsHeroVisual() {
  return (
    <MockWindow title="Campaigns · New campaign" className="vz-cmp-window">
      <ol className="vz-cmp-steps">
        {STEPS.map((step, i) => (
          <li key={step} className={i < 2 ? "is-done" : i === 2 ? "is-active" : undefined}>
            <span>{i < 2 ? <Check size={11} /> : i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <b className="vz-cmp-h">Timing &amp; Follow-up</b>
      <span className="mk-label"><Timer size={11} /> Send delay</span>
      <div className="vz-cmp-delays">
        {DELAYS.map((delay) => (
          <span key={delay} className={delay === "2 hours" ? "is-active" : undefined}>{delay}</span>
        ))}
      </div>
      <div className="vz-cmp-switch">
        <div><b>Enable reminder drip</b><small>Stops automatically if they click or leave a review.</small></div>
        <i aria-hidden="true" />
      </div>
      <ol className="vz-cmp-drip">
        <li><b>Day 0</b><span>First message, 2 hours after contacts are added</span></li>
        <li><b>Day 7</b><span>“Just a friendly reminder - we’d love to hear about your experience at Northside Auto”</span></li>
        <li><b>Day 14</b><span>Reuses the day 7 message unless you write a new one</span></li>
      </ol>
      <span className="mk-button">Next <ArrowRight size={14} /></span>
    </MockWindow>
  );
}

type Template = { icon: LucideIcon; name: string; fit: string; channel: string; delay: string; reminders: boolean };

const TEMPLATES: Template[] = [
  { icon: Zap, name: "Post-Visit Review", fit: "Retail and restaurants", channel: "SMS", delay: "1 hour", reminders: true },
  { icon: Calendar, name: "Appointment Follow-up", fit: "Services, clinics and salons", channel: "SMS + Email", delay: "2 hours", reminders: false },
  { icon: Users, name: "Customer Re-engagement", fit: "Customers you haven’t seen lately", channel: "Email", delay: "Immediately", reminders: true },
];

/** The three built-in templates with their real defaults, and the message they start you with. */
export function CampaignsTemplatesVisual() {
  return (
    <div className="mk-stack vz-cmp-tpl-wrap">
      <div className="vz-cmp-tpls">
        {TEMPLATES.map(({ icon: Icon, name, fit, channel, delay, reminders }) => (
          <div key={name} className={`vz-cmp-tpl${name === "Appointment Follow-up" ? " is-active" : ""}`} aria-hidden="true">
            <span className="vz-cmp-tpl-icon"><Icon size={15} /></span>
            <b>{name}</b>
            <small>{fit}</small>
            <div className="mk-wrap">
              <MockPill tone="dark">{channel}</MockPill>
              <MockPill>{delay}</MockPill>
              {reminders && <MockPill tone="brand" icon={Repeat}>Reminders</MockPill>}
            </div>
          </div>
        ))}
      </div>
      <div className="vz-cmp-editor" aria-hidden="true">
        <span className="mk-label"><MessageSquare size={11} /> SMS template</span>
        <p>
          Hi <code>{"{customer_name}"}</code>, thanks for choosing <code>{"{business_name}"}</code> for your appointment.
          How did we do? <code>{"{review_link}"}</code>
        </p>
        <span className="mk-label"><Mail size={11} /> Email subject</span>
        <p>Thank you for your visit to <code>{"{business_name}"}</code></p>
      </div>
      <MockCaption>Template defaults as they appear in the builder. Every field can be edited.</MockCaption>
    </div>
  );
}

const CONTACTS = [
  { name: "Dana Kim", channel: "SMS", status: "Completed", tone: "positive" as const },
  { name: "Ray Morales", channel: "Email", status: "Clicked", tone: "brand" as const },
  { name: "Jess Patel", channel: "SMS", status: "Sent", tone: "neutral" as const },
];

/** A running campaign's page with stats and contacts, and the Add Contacts dialog floating over it. */
export function CampaignsResultsVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-cmp-results">
        <MockWindow title="Campaigns · Service follow-up">
          <div className="vz-cmp-head">
            <b>Service follow-up</b>
            <MockPill tone="positive">Active</MockPill>
            <span className="mk-pill">Pause</span>
          </div>
          <div className="vz-cmp-stats">
            <MockStat label="Sent" value="86" />
            <MockStat label="Opened" value="51" />
            <MockStat label="Clicked" value="34" />
            <MockStat label="Completed" value="19" />
          </div>
          <div className="vz-cmp-table">
            <span>Name</span><span>Channel</span><span>Status</span>
            {CONTACTS.map((c) => (
              <div key={c.name} className="vz-cmp-tr">
                <b>{c.name}</b><small>{c.channel}</small><MockPill tone={c.tone}>{c.status}</MockPill>
              </div>
            ))}
          </div>
        </MockWindow>
        <div className="vz-cmp-add" aria-hidden="true">
          <b>Add Contacts</b>
          <div className="vz-cmp-tabs"><span>Single</span><span className="is-active">Bulk</span></div>
          <small>Phone Numbers (one per line)</small>
          <pre>(555) 410-2231{"\n"}(555) 872-0915{"\n"}(555) 306-4478</pre>
          <span className="mk-button">Send Now</span>
        </div>
      </div>
      <MockCaption>Example data for a fictional auto shop.</MockCaption>
    </div>
  );
}
