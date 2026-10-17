import { Check, Download, EyeOff, Globe, LockKeyhole, Search, Smartphone } from "lucide-react";
import {
  MockCaption, MockPill, MockStars, MockWindow, OverlayCard,
} from "@/components/marketing/feature-landing/visuals/mock-primitives";

type Platform = "google" | "facebook" | "yelp";

const SOURCE: Record<Platform, { letter: string; name: string }> = {
  google: { letter: "G", name: "Google" },
  facebook: { letter: "f", name: "Facebook" },
  yelp: { letter: "Y", name: "Yelp" },
};

function InboxItem({ platform, name, rating, when, text, selected }: {
  platform: Platform; name: string; rating: number; when: string; text: string; selected?: boolean;
}) {
  return (
    <div className={`vz-mon-item${selected === undefined ? "" : " has-check"}`}>
      {selected !== undefined && <span className={`vz-mon-check${selected ? " is-on" : ""}`}>{selected && <Check size={11} />}</span>}
      <span className={`vz-mon-src vz-mon-src-${platform}`}>{SOURCE[platform].letter}</span>
      <div className="vz-mon-item-body">
        <div className="vz-mon-item-head">
          <b>{name}</b>
          <MockStars value={rating} size={11} />
        </div>
        <small>{SOURCE[platform].name} · {when}</small>
        <p>{text}</p>
      </div>
    </div>
  );
}

/** Reviews inbox with platform badges, the Needs reply filter and an incoming text alert. */
export function MonitoringHeroVisual() {
  return (
    <div className="vz-mon-hero">
      <MockWindow title="Reviews · Corner Bakery">
        <div className="vz-mon-tabs">
          <span className="is-active"><Globe size={13} />Public reviews <i>128</i></span>
          <span><LockKeyhole size={13} />Private feedback <i>6</i></span>
        </div>
        <div className="vz-mon-seg">
          <span>All</span><span className="is-active">Needs reply</span><span>Responded</span><span>Ignored</span>
        </div>
        <div className="mk-stack">
          <InboxItem platform="google" name="Dana R." rating={2} when="12 min ago" text="Waited twenty minutes for a coffee and nobody said a word." />
          <InboxItem platform="facebook" name="Marcus T." rating={5} when="3 h ago" text="Best sourdough in the neighborhood. Staff are lovely." />
          <InboxItem platform="yelp" name="Ana P." rating={4} when="Yesterday" text="Great croissants, a little pricey but worth it." />
        </div>
      </MockWindow>
      <div className="vz-mon-toast">
        <OverlayCard icon={Smartphone} tone="dark" title="New 2★ review for Corner Bakery" text="“Waited twenty minutes for a coffee…”" />
      </div>
    </div>
  );
}

const PLATFORMS: { platform: Platform; status: string; lines: string[] }[] = [
  { platform: "google", status: "Reply from Zyene", lines: ["Google Business Profile sign-in", "Replies post to your profile"] },
  { platform: "facebook", status: "Monitor", lines: ["Page recommendations sync in", "Recommends = 5★, doesn’t recommend = 1★"] },
  { platform: "yelp", status: "Monitor", lines: ["3 most recent reviews per check", "Reply on yelp.com"] },
];

/** Three connection cards, cascading, showing what each platform supports. */
export function MonitoringPlatformsVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-mon-cascade">
        {PLATFORMS.map(({ platform, status, lines }) => (
          <div key={platform} className="vz-mon-conn">
            <div className="vz-mon-conn-head">
              <span className={`vz-mon-src vz-mon-src-${platform}`}>{SOURCE[platform].letter}</span>
              <b>{SOURCE[platform].name}</b>
              <MockPill tone={platform === "google" ? "positive" : "neutral"}>{status}</MockPill>
            </div>
            <ul>
              {lines.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <MockCaption>How each connection behaves in the inbox.</MockCaption>
    </div>
  );
}

/** Search, rating filter, CSV export and the bulk action bar. */
export function MonitoringTriageVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Reviews · Northside Auto">
        <div className="vz-mon-toolbar">
          <span className="vz-mon-search"><Search size={13} />Search by name or keyword…</span>
          <span className="mk-button mk-button-ghost vz-mon-export"><Download size={13} />Export CSV</span>
        </div>
        <div className="mk-wrap">
          <MockPill tone="dark">Needs reply</MockPill>
          <MockPill>3 stars</MockPill>
          <MockPill>Lowest rated</MockPill>
        </div>
        <div className="mk-stack">
          <InboxItem platform="yelp" name="Chris L." rating={3} when="2 days ago" text="Fair price, but the waiting room was packed." selected />
          <InboxItem platform="facebook" name="Jo W." rating={3} when="4 days ago" text="Okay service. Car was ready a day late." selected />
          <InboxItem platform="google" name="Sam K." rating={3} when="1 week ago" text="Fixed the noise, but call me with updates next time." selected={false} />
        </div>
        <div className="vz-mon-bulk">
          <span className="vz-mon-bulk-count"><i>2</i>Selected</span>
          <span><EyeOff size={12} />Mark as Ignored</span>
          <span><Check size={12} />Pending</span>
        </div>
      </MockWindow>
      <MockCaption>Bulk actions and export work per business.</MockCaption>
    </div>
  );
}
