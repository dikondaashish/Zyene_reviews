import { Building2, Check, ChevronDown, Plus, Search } from "lucide-react";
import { MockCaption, MockPill, MockStars, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const LOCATIONS = [
  { name: "Bright Smile Dental · Downtown", city: "Dentist · Austin, TX", rating: "4.8", count: "312", pending: 2, google: true, current: true },
  { name: "Bright Smile Dental · Northside", city: "Dentist · Round Rock, TX", rating: "4.7", count: "188", pending: 0, google: true, current: false },
  { name: "Bright Smile Dental · Lakeview", city: "Dentist · Cedar Park, TX", rating: "4.9", count: "96", pending: 1, google: false, current: false },
];

/** Businesses directory with the business switcher open on top of it. */
export function MultiLocationHeroVisual() {
  return (
    <div className="vz-ml-hero">
      <MockWindow title="Businesses">
        <div className="vz-ml-toolbar">
          <div className="mk-wrap">
            <MockPill tone="dark">All businesses 3</MockPill>
            <MockPill>Needs connection 1</MockPill>
          </div>
          <span className="vz-ml-search"><Search size={12} />Search businesses…</span>
        </div>
        {LOCATIONS.map((l) => (
          <div key={l.name} className="vz-ml-loc">
            <span className="vz-ml-logo"><Building2 size={15} /></span>
            <div className="vz-ml-loc-text">
              <b>{l.name}</b>
              <small>{l.city}</small>
            </div>
            <div className="vz-ml-loc-rep">
              <span><MockStars value={5} size={10} /> {l.rating}</span>
              <small>{l.count} reviews · {l.pending} pending</small>
            </div>
            {l.google ? <MockPill tone="positive">Google connected</MockPill> : <MockPill tone="caution">Connect Google</MockPill>}
          </div>
        ))}
        <div className="vz-ml-usage"><span>3 of 3 locations on Professional</span><b>Manage plan</b></div>
      </MockWindow>
      <div className="vz-ml-switcher" aria-hidden="true">
        <span className="vz-ml-switcher-btn">Downtown<ChevronDown size={13} /></span>
        <div className="vz-ml-menu">
          <span className="mk-label">Business</span>
          {LOCATIONS.map((l) => (
            <span key={l.name} className="vz-ml-item">{l.name.split(" · ")[1]}{l.current && <Check size={13} />}</span>
          ))}
          <span className="vz-ml-item vz-ml-add"><Plus size={13} />Add a Business</span>
        </div>
      </div>
      <MockCaption>Example organization with three fictional dental offices.</MockCaption>
    </div>
  );
}

const MEMBERS: [string, string, string][] = [
  ["Dr. Ana Ortiz", "ana@brightsmile.example", "Owner"],
  ["Sam Patel", "sam@brightsmile.example", "Admin"],
  ["Priya Nair", "priya@brightsmile.example", "Manager"],
  ["Jordan Lee", "jordan@brightsmile.example", "Member"],
  ["Casey Moore", "casey@brightsmile.example", "Viewer"],
];

/** Team settings for one location, with roles and seats. */
export function MultiLocationTeamVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Settings · Team · Northside">
        <div className="vz-ml-seats"><span>Team seats</span><b>5 of 15</b></div>
        {MEMBERS.map(([name, email, role], i) => (
          <div key={name} className="vz-ml-member">
            <span className="vz-ml-avatar">{name.replace("Dr. ", "")[0]}</span>
            <div className="vz-ml-loc-text"><b>{name}</b><small>{email}</small></div>
            <MockPill tone={i === 0 ? "dark" : i < 3 ? "brand" : "neutral"}>{role}</MockPill>
          </div>
        ))}
        <span className="mk-button"><Plus size={14} />Invite teammate</span>
      </MockWindow>
      <MockCaption>Example team. Owners and admins can invite any role; managers invite managers and members.</MockCaption>
    </div>
  );
}

/** Each location's own link, plus the Professional allowance that grows with every location. */
export function MultiLocationAllowanceVisual() {
  return (
    <div className="vz-ml-allow">
      <div className="vz-ml-links">
        {LOCATIONS.map((l) => (
          <div key={l.name} className="vz-ml-link">
            <b>{l.name.split(" · ")[1]}</b>
            <small>collectratings.com/bright-smile-{l.name.split(" · ")[1].toLowerCase()}</small>
          </div>
        ))}
      </div>
      <div className="vz-ml-meter">
        <span className="mk-label">SMS requests this month</span>
        <div className="vz-ml-meter-head"><b>1,240</b><span>of 2,100</span></div>
        <div className="vz-ml-track"><i style={{ width: "59%" }} /></div>
        <small>Professional: 700 per location × 3 locations, shared across the organization</small>
      </div>
      <MockCaption>Example usage for a fictional three-location practice.</MockCaption>
    </div>
  );
}
