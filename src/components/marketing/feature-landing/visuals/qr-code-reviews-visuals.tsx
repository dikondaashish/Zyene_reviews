import { Check, Coffee, Download, Printer, QrCode, ScanLine, Share2, TriangleAlert } from "lucide-react";
import { QrGlyph } from "@/components/marketing/feature-landing/visuals/qr-code-glyph";
import {
  MockBar, MockCaption, MockPhone, MockPill, MockStars, MockWindow,
} from "@/components/marketing/feature-landing/visuals/mock-primitives";

/** The printable table poster, with a phone showing the page a scan opens. */
export function QrCodeHeroVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-qr-hero">
        <div className="vz-qr-poster" aria-hidden="true">
          <span className="vz-qr-logo"><Coffee size={18} /></span>
          <b className="vz-qr-name">Corner Café</b>
          <span className="vz-qr-cta">Scan to Leave Us a Google Review</span>
          <MockStars value={5} size={14} />
          <span className="vz-qr-frame"><QrGlyph seed={11} /></span>
          <small className="vz-qr-url">collectratings.com/corner-cafe</small>
          <small className="vz-qr-powered">Powered by Zyene Reviews</small>
        </div>
        <MockPhone className="vz-qr-phone">
          <span className="vz-qr-scan"><ScanLine size={13} /> collectratings.com/corner-cafe</span>
          <b className="vz-qr-phone-biz">Corner Café</b>
          <span className="vz-qr-q">How was your visit today?</span>
          <MockStars value={4} size={20} />
          <span className="mk-button">Continue</span>
        </MockPhone>
      </div>
      <MockCaption>Example poster and review page for a fictional café.</MockCaption>
    </div>
  );
}

const ACTIONS = [
  { icon: QrCode, label: "Show QR code", primary: true },
  { icon: Share2, label: "Share link", primary: false },
  { icon: Download, label: "Download", primary: false },
  { icon: Printer, label: "Print poster", primary: false },
];

/** The review-link card on the dashboard, with its copy, share, download and print actions. */
export function QrCodePortalCardVisual() {
  return (
    <div className="mk-stack vz-qr-center">
      <div className="vz-qr-card" aria-hidden="true">
        <span className="vz-qr-kicker">Your customer portal</span>
        <b className="vz-qr-card-title">Share it. Collect reviews.</b>
        <span className="vz-qr-card-frame"><QrGlyph seed={23} /></span>
        <div className="vz-qr-linkbar">
          <span>collectratings.com/bright-smile</span>
          <b>Copy</b>
        </div>
        <div className="vz-qr-actions">
          {ACTIONS.map((action) => (
            <span key={action.label} className={action.primary ? "is-primary" : undefined}>
              <action.icon size={13} />
              {action.label}
            </span>
          ))}
        </div>
      </div>
      <MockCaption>Dashboard card, shown for a fictional dental practice.</MockCaption>
    </div>
  );
}

/** Choosing the link name, and where scans show up in analytics. */
export function QrCodeLinkVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Settings · Review page link">
        <span className="mk-label">Your review link</span>
        <div className="vz-qr-slug">
          <span>collectratings.com/</span>
          <b>northside-auto</b>
          <MockPill tone="positive" icon={Check}>Available</MockPill>
        </div>
        <div className="vz-qr-warn">
          <TriangleAlert size={14} />
          <span>Changing your link stops existing QR codes and printed materials from working.</span>
        </div>
        <span className="mk-label">Requests by channel</span>
        <MockBar label="SMS" value={70} caption="118" />
        <MockBar label="Email" value={32} tone="muted" caption="54" />
        <MockBar label="Link (QR scans + shared links)" value={50} tone="positive" caption="84" />
      </MockWindow>
      <MockCaption>Example numbers for a fictional auto shop.</MockCaption>
    </div>
  );
}
