import {
  CheckCircle2, Download, Eye, FileDown, Link2, Mail, MessageSquare, MousePointer2, Search, Send, Sparkles, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MockBar, MockCaption, MockPill, MockStat, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const RANGES = ["7 Days", "30 Days", "90 Days", "12 Months"];
const VOLUME = [38, 52, 44, 61, 47, 70, 58, 66, 74, 63, 81, 72];

/** Analytics overview: date range, the four headline cards and a review volume chart. */
export function AnalyticsHeroVisual() {
  return (
    <div className="vz-an-hero">
      <MockWindow title="Analytics · Bright Smile Dental">
        <div className="vz-an-toolbar">
          <div className="vz-an-seg">
            {RANGES.map((range) => (
              <span key={range} className={range === "30 Days" ? "is-active" : undefined}>{range}</span>
            ))}
          </div>
          <div className="mk-wrap">
            <MockPill tone="dark" icon={FileDown}>Download PDF Report</MockPill>
            <MockPill icon={Download}>Export CSV</MockPill>
          </div>
        </div>
        <div className="vz-an-stats">
          <MockStat label="New Reviews" value="46" trend="+12% vs last period" />
          <MockStat label="Average Rating" value="4.8" trend="+0.1 vs last period" />
          <MockStat label="Response Rate" value="94%" trend="+6% vs last period" />
          <MockStat label="Requests Sent" value="318" trend="+9% vs last period" />
        </div>
        <div className="vz-an-chart">
          <span className="mk-label">Review volume</span>
          <div className="vz-an-cols">
            {VOLUME.map((height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </MockWindow>
      <MockCaption>Example data for a fictional dental practice.</MockCaption>
    </div>
  );
}

const FUNNEL: { label: string; count: number; icon: LucideIcon }[] = [
  { label: "Sent", count: 318, icon: Send },
  { label: "Delivered", count: 309, icon: CheckCircle2 },
  { label: "Opened", count: 214, icon: Eye },
  { label: "Link Clicked", count: 151, icon: MousePointer2 },
  { label: "Completed", count: 102, icon: Sparkles },
  { label: "Google handoff", count: 88, icon: Star },
];

/** Own Platform tab: the review request funnel with the channel split floating beside it. */
export function AnalyticsFunnelVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-an-split">
        <div className="vz-an-card">
          <b className="vz-an-card-title">Review Request Funnel</b>
          <small className="vz-an-card-sub">From send to Google hand-off · Last 30 days</small>
          <div className="vz-an-funnel">
            {FUNNEL.map(({ label, count, icon: Icon }) => (
              <div key={label} className="vz-an-step">
                <span className="vz-an-step-label"><Icon size={13} />{label}</span>
                <span className="vz-an-step-track"><i style={{ width: `${Math.round((count / 318) * 100)}%` }} /></span>
                <b>{count}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="vz-an-card vz-an-card-float">
          <b className="vz-an-card-title">Channel Performance</b>
          <small className="vz-an-card-sub">SMS, Email and Link side by side</small>
          <div className="vz-an-channel"><MessageSquare size={14} /><MockBar label="SMS" value={52} caption="52% CTR" /></div>
          <div className="vz-an-channel"><Mail size={14} /><MockBar label="Email" value={34} tone="muted" caption="34% CTR" /></div>
          <div className="vz-an-channel"><Link2 size={14} /><MockBar label="Link" value={61} tone="positive" caption="61% CTR" /></div>
        </div>
      </div>
      <MockCaption>Example data. QR code scans are counted in Link.</MockCaption>
    </div>
  );
}

const KEYWORDS = [
  { term: "dentist near me", value: 1240, width: 100 },
  { term: "teeth whitening", value: 610, width: 49 },
  { term: "bright smile dental", value: 420, width: 34 },
  { term: "emergency dentist", value: 285, width: 23 },
];

/** Google Business insights: listing performance totals and search keywords. */
export function AnalyticsGoogleVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Analytics · Google Business insights">
        <div className="vz-an-tiles">
          <MockStat label="Profile views" value="3,482" />
          <MockStat label="Website clicks" value="214" />
          <MockStat label="Direction requests" value="167" />
          <MockStat label="Call clicks" value="96" />
        </div>
        <span className="mk-label"><Search size={11} /> Search keywords · monthly impressions</span>
        <div className="mk-stack">
          {KEYWORDS.map((k) => (
            <MockBar key={k.term} label={k.term} value={k.width} caption={k.value.toLocaleString("en-US")} />
          ))}
        </div>
        <div className="mk-wrap">
          <MockPill tone="brand">Discovery 72%</MockPill>
          <MockPill>Branded 28%</MockPill>
        </div>
      </MockWindow>
      <MockCaption>Example data. Google numbers come from your Business Profile.</MockCaption>
    </div>
  );
}
