import type { LucideIcon } from "lucide-react";
import {
  ArrowDown, Code2, CreditCard, Link2, Mail, Megaphone, MessageSquare, Nfc, QrCode, ShieldCheck, Star, Webhook,
} from "lucide-react";
import type { PillTone } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import {
  MockCaption, MockPill, MockRow, MockStat, MockWindow, OverlayCard,
} from "@/components/marketing/feature-landing/visuals/mock-primitives";

type FeedItem = { icon: LucideIcon; name: string; meta: string; status: string; tone: PillTone };

const FEED: FeedItem[] = [
  { icon: MessageSquare, name: "Dana R.", meta: "SMS · after a cleaning visit", status: "Completed", tone: "positive" },
  { icon: QrCode, name: "Front desk QR code", meta: "Link · scanned at checkout", status: "Opened", tone: "brand" },
  { icon: Mail, name: "Marcus T.", meta: "Email · campaign reminder, day 7", status: "Sent", tone: "neutral" },
  { icon: Nfc, name: "Reception NFC stand", meta: "Link · tapped while paying", status: "Completed", tone: "positive" },
];

/** Requests activity for one location, with a private-feedback alert floating over it. */
export function ReviewCollectionHeroVisual() {
  return (
    <div className="vz-rc-hero">
      <MockWindow title="Requests · Bright Smile Dental">
        <div className="mk-grid-3">
          <MockStat label="Sent" value="214" />
          <MockStat label="Opened" value="131" />
          <MockStat label="Completed" value="62" />
        </div>
        <span className="mk-label">Recent activity</span>
        <div className="mk-stack">
          {FEED.map((item) => (
            <MockRow
              key={item.name}
              icon={item.icon}
              title={item.name}
              meta={item.meta}
              trailing={<MockPill tone={item.tone}>{item.status}</MockPill>}
            />
          ))}
        </div>
      </MockWindow>
      <div className="vz-rc-toast">
        <OverlayCard icon={ShieldCheck} title="Private feedback · 2 stars" text="Sent to your team, not posted anywhere" tone="caution" />
      </div>
    </div>
  );
}

const CHANNELS: { icon: LucideIcon; name: string; meta: string }[] = [
  { icon: QrCode, name: "QR code", meta: "Tables, doors, receipts" },
  { icon: Nfc, name: "NFC stand", meta: "Tap at the counter" },
  { icon: MessageSquare, name: "SMS", meta: "After the visit" },
  { icon: Mail, name: "Email", meta: "Or both at once" },
  { icon: Megaphone, name: "Campaigns", meta: "Lists + reminders" },
  { icon: Webhook, name: "POS & API", meta: "Square, webhooks" },
];

/** Every channel funnels into one review link, which then splits by rating. */
export function ReviewCollectionChannelsVisual() {
  return (
    <div className="mk-stack vz-rc-hub">
      <div className="vz-rc-tiles">
        {CHANNELS.map((channel) => (
          <div key={channel.name} className="vz-rc-tile">
            <channel.icon size={16} />
            <b>{channel.name}</b>
            <small>{channel.meta}</small>
          </div>
        ))}
      </div>
      <span className="vz-rc-arrow"><ArrowDown size={16} /></span>
      <div className="vz-rc-url">
        <Link2 size={14} />
        <span>collectratings.com/<b>northside-auto</b></span>
      </div>
      <span className="vz-rc-arrow"><ArrowDown size={16} /></span>
      <div className="mk-grid-2">
        <div className="vz-rc-lane is-positive">
          <Star size={15} />
          <b>4–5 stars</b>
          <small>Draft, copy and go to Google</small>
        </div>
        <div className="vz-rc-lane is-caution">
          <ShieldCheck size={15} />
          <b>1–3 stars</b>
          <small>Optional private note to your team, plus the link to Google</small>
        </div>
      </div>
      <MockCaption>Every rating keeps the link to Google. Default 4-star threshold shown.</MockCaption>
    </div>
  );
}

const API_SAMPLE = `POST /api/v1/requests/send
X-API-Key: <your key>

{
  "customerName": "Dana R.",
  "customerPhone": "+1 555 0142",
  "channel": "sms"
}`;

/** Automatic triggers: the REST API, Square and a Zapier-style webhook. */
export function ReviewCollectionTriggersVisual() {
  return (
    <div className="mk-stack vz-rc-auto">
      <div className="vz-rc-code">
        <span className="vz-rc-code-bar"><Code2 size={13} /> REST API</span>
        <pre>{API_SAMPLE}</pre>
      </div>
      <MockRow
        icon={CreditCard}
        title="Square payment completed"
        meta="Request sent to the customer on the payment"
        trailing={<MockPill tone="brand">Early access</MockPill>}
      />
      <MockRow
        icon={Webhook}
        title="Webhooks by Zapier"
        meta="POST /api/webhooks/generic"
        trailing={<MockPill tone="positive">Active</MockPill>}
      />
    </div>
  );
}
