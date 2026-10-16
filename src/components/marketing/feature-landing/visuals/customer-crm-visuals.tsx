import { Check, Download, FileSpreadsheet, Send, ShieldCheck, Tag, Upload, UserPlus } from "lucide-react";
import { MockCaption, MockPill, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const SEGMENTS: [string, number][] = [
  ["All", 248], ["Not completed", 61], ["Completed request", 94], ["Recent", 37], ["No Contact Info", 6], ["Opted Out", 3],
];

const PEOPLE = [
  { name: "Maria Gonzalez", contact: "maria@example.com", tags: ["regulars"], sent: 2, checked: true },
  { name: "James Turner", contact: "(555) 610-2290", tags: ["catering"], sent: 1, checked: true },
  { name: "Aisha Bello", contact: "aisha@example.com", tags: ["regulars", "brunch"], sent: 1, checked: true },
  { name: "Ben Carter", contact: "(555) 228-7013", tags: [], sent: 3, checked: false },
];

/** The Customers page: stats, segment tabs, a selection with the bulk action bar, and the list. */
export function CrmHeroVisual() {
  return (
    <MockWindow title="Customers" className="vz-crm-window">
      <div className="vz-crm-actions">
        <span className="mk-pill"><Upload size={12} />Import CSV</span>
        <span className="mk-pill"><Download size={12} />Export CSV</span>
        <span className="mk-pill mk-pill-dark"><UserPlus size={12} />Add Customer</span>
      </div>
      <div className="vz-crm-stats">
        <span><b>248</b>Customers</span>
        <span><b>38%</b>Request completion</span>
        <span><b>61</b>Not completed</span>
        <span><b>1.4</b>Avg requests sent</span>
      </div>
      <div className="vz-crm-segs">
        {SEGMENTS.map(([label, count], i) => (
          <span key={label} className={i === 1 ? "is-active" : undefined}>{label} ({count})</span>
        ))}
      </div>
      <div className="vz-crm-bulk">
        <b>3</b><span>selected</span>
        <span className="mk-pill mk-pill-brand"><Send size={12} />Send Request</span>
        <span className="mk-pill"><Tag size={12} />Add Tag</span>
      </div>
      <div className="vz-crm-list">
        {PEOPLE.map((p) => (
          <div key={p.name} className="vz-crm-tr">
            <i className={p.checked ? "is-checked" : undefined}>{p.checked && <Check size={10} />}</i>
            <span className="vz-crm-who"><b>{p.name}</b><small>{p.contact}</small></span>
            <span className="vz-crm-tags">{p.tags.map((t) => <MockPill key={t}>{t}</MockPill>)}</span>
            <small className="vz-crm-sent">{p.sent} sent</small>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}

const ROWS = [
  ["Maria Gonzalez", "maria@example.com", "+1 555 201 4410"],
  ["James Turner", "", "+1 555 610 2290"],
  ["Aisha Bello", "aisha@example.com", ""],
];

/** Before and after: a spreadsheet export, then the Import Customers dialog with preview and consent. */
export function CrmImportVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-crm-import" aria-hidden="true">
        <div className="vz-crm-sheet">
          <span className="vz-crm-file"><FileSpreadsheet size={14} />customers.csv</span>
          <div className="vz-crm-grid">
            <b>name</b><b>email</b><b>phone</b>
            {ROWS.map((row) => row.map((cell, i) => <span key={`${row[0]}-${i}`}>{cell || "-"}</span>))}
          </div>
          <small>+ 309 more rows</small>
        </div>
        <div className="vz-crm-modal">
          <b>Import Customers</b>
          <MockPill tone="positive" icon={Check}>CSV loaded: 312 rows</MockPill>
          <div className="vz-crm-preview">
            {ROWS.map((row) => <span key={row[0]}>{row[0]}<small>{row[1] || row[2]}</small></span>)}
          </div>
          <span className="vz-crm-consent"><i><Check size={10} /></i>I confirm I have explicit consent.</span>
          <small className="vz-crm-hint"><ShieldCheck size={12} />Matching email or phone updates an existing contact.</small>
          <span className="mk-button">Import Customers</span>
        </div>
      </div>
      <MockCaption>Example file for a fictional coffee shop.</MockCaption>
    </div>
  );
}

const ACTIVITY = [
  { title: "Review request · SMS", meta: "Oct 12 · Request completed; publication unverified", pill: "Completed", tone: "positive" as const },
  { title: "Private feedback · 3 stars", meta: "Jul 3 · “Waited a while for my order on Saturday.”", pill: "Feedback", tone: "caution" as const },
  { title: "Review request · Email", meta: "Jul 2 · Sent to maria@example.com", pill: "Delivered", tone: "neutral" as const },
];

/** One customer's profile with summary numbers and the activity timeline, side by side. */
export function CrmProfileVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-crm-profile" aria-hidden="true">
        <div className="vz-crm-card">
          <span className="vz-crm-avatar">MG</span>
          <b>Maria Gonzalez</b>
          <small>maria@example.com</small>
          <small>+1 555 201 4410</small>
          <div className="mk-wrap"><MockPill tone="brand">regulars</MockPill><MockPill tone="brand">brunch</MockPill></div>
          <div className="vz-crm-sum">
            <span><b>2</b>Requests sent</span>
            <span><b>1</b>Completed</span>
          </div>
          <span className="mk-button">Send review request</span>
        </div>
        <ol className="vz-crm-timeline">
          <span className="mk-label">Activity</span>
          {ACTIVITY.map((a) => (
            <li key={a.title}>
              <div><b>{a.title}</b><small>{a.meta}</small></div>
              <MockPill tone={a.tone}>{a.pill}</MockPill>
            </li>
          ))}
        </ol>
      </div>
      <MockCaption>Example customer at a fictional coffee shop.</MockCaption>
    </div>
  );
}
