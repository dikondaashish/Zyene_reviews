import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Star } from "lucide-react";

/**
 * Building blocks for feature-page product mocks. Mocks are decorative
 * (aria-hidden); the surrounding figure carries the accessible label.
 * Use fictional businesses and say so in a caption.
 */

export function MockWindow({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`mk-window ${className}`} aria-hidden="true">
      <div className="mk-window-bar">
        <span /><span /><span />
        <b>{title}</b>
      </div>
      <div className="mk-window-body">{children}</div>
    </div>
  );
}

export function MockPhone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mk-phone ${className}`} aria-hidden="true">
      <span className="mk-phone-notch" />
      <div className="mk-phone-body">{children}</div>
    </div>
  );
}

export function MockStars({ value = 5, size = 16 }: { value?: number; size?: number }) {
  return (
    <span className="mk-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= value ? "currentColor" : "none"} className={n <= value ? undefined : "mk-star-off"} />
      ))}
    </span>
  );
}

export type PillTone = "brand" | "positive" | "caution" | "neutral" | "dark";

export function MockPill({ children, tone = "neutral", icon: Icon }: { children: ReactNode; tone?: PillTone; icon?: LucideIcon }) {
  return (
    <span className={`mk-pill mk-pill-${tone}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export function MockStat({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="mk-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && <small>{trend}</small>}
    </div>
  );
}

/** Horizontal bar with a label and a 0-100 fill. */
export function MockBar({ label, value, tone = "brand", caption }: { label: string; value: number; tone?: "brand" | "muted" | "positive"; caption?: string }) {
  return (
    <div className="mk-bar">
      <div className="mk-bar-head">
        <span>{label}</span>
        {caption && <b>{caption}</b>}
      </div>
      <div className="mk-bar-track">
        <i className={`mk-bar-fill mk-bar-${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function MockRow({ icon: Icon, title, meta, trailing }: { icon?: LucideIcon; title: string; meta?: string; trailing?: ReactNode }) {
  return (
    <div className="mk-row">
      {Icon && <span className="mk-row-icon"><Icon size={15} /></span>}
      <div className="mk-row-text">
        <b>{title}</b>
        {meta && <small>{meta}</small>}
      </div>
      {trailing && <div className="mk-row-trailing">{trailing}</div>}
    </div>
  );
}

/** Floating card laid over a photo, e.g. a notification or a step in the flow. */
export function OverlayCard({ icon: Icon, title, text, tone = "brand" }: { icon: LucideIcon; title: string; text: string; tone?: PillTone }) {
  return (
    <div className={`mk-overlay mk-overlay-${tone}`} aria-hidden="true">
      <span className="mk-overlay-icon"><Icon size={16} /></span>
      <div>
        <b>{title}</b>
        <small>{text}</small>
      </div>
    </div>
  );
}

/** Small caption under a mock, e.g. "Fictional business data". */
export function MockCaption({ children }: { children: ReactNode }) {
  return <p className="mk-caption">{children}</p>;
}
