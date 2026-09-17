"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { BarChart3, Coffee, MessageSquare, RotateCcw, Send, ShieldCheck, ChevronDown, Sparkles } from "lucide-react";
import { ReviewDemo } from "@/components/marketing/product-tour/review-demo";
import { RequestDemo } from "@/components/marketing/product-tour/request-demo";
import { ReportDemo } from "@/components/marketing/product-tour/report-demo";

import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";

const TABS = [
  { key: "reviews", label: "Reviews & replies", icon: MessageSquare },
  { key: "requests", label: "Review requests", icon: Send },
  { key: "reports", label: "Reporting", icon: BarChart3 },
] as const;
export type ProductTourTab = (typeof TABS)[number]["key"];

export function ProductTour({ initialTab = "reviews", activeTab, onTabChange }: {
  initialTab?: ProductTourTab; activeTab?: ProductTourTab; onTabChange?: (tab: ProductTourTab) => void;
}) {
  const [version, setVersion] = useState(0);
  const [localTab, setLocalTab] = useState(initialTab);
  const setActive = (tab: ProductTourTab) => { setLocalTab(tab); onTabChange?.(tab); };
  function reset() { setVersion(value => value + 1); setActive(initialTab); }
  return <div className="tour-container"><ProductTourSession key={version} active={activeTab ?? localTab} setActive={setActive} onReset={reset} /></div>;
}

function ProductTourSession({ active, setActive, onReset }: {
  active: ProductTourTab; setActive: (tab: ProductTourTab) => void; onReset: () => void;
}) {
  const [pointerMotion, setPointerMotion] = useState(false);
  const id = useId();
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = (event.key === "ArrowRight" || event.key === "ArrowDown") ? (index + 1) % TABS.length
      : (event.key === "ArrowLeft" || event.key === "ArrowUp") ? (index + TABS.length - 1) % TABS.length
        : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActive(TABS[next].key);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  }
  return (
    <div className="product-tour" data-pointer-motion={pointerMotion} onPointerDownCapture={() => setPointerMotion(true)} onKeyDownCapture={() => setPointerMotion(false)}>
      <aside className="tour-sidebar" aria-label="Demo workspace">
        <div className="tour-wordmark"><ZyeneReviewsLogoMark size={28} /><span>Zyene <b>Reviews</b></span></div>
        <div className="tour-business"><Coffee size={17} aria-hidden="true" /><span>Juniper Coffee<small>Example workspace</small></span><ChevronDown size={13} aria-hidden="true" /></div>
        <span className="tour-nav-label">WORKSPACE</span>
        <div className="tour-tabs" role="tablist" aria-label="Explore Zyene" aria-orientation="vertical">
          {TABS.map(({ key, label, icon: Icon }, index) => <button key={key} type="button" role="tab" id={`${id}-${key}`} aria-selected={active === key} aria-controls={`${id}-${key}-panel`} tabIndex={active === key ? 0 : -1} onClick={() => setActive(key)} onKeyDown={event => onKeyDown(event, index)}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>)}
        </div>
        <div className="tour-sidebar-tip"><Sparkles size={18} aria-hidden="true" /><strong>Your voice. A little faster.</strong><p>Try a tone. Watch your next reply come together.</p></div>
        <div className="tour-sidebar-user"><span>JC</span><div>Juniper Coffee<small>Business workspace</small></div></div>
      </aside>
      <div className="tour-workspace">
      <div className="tour-toolbar">
        <span className="tour-breadcrumb">Workspace <span>/</span> <strong>{TABS.find(tab => tab.key === active)?.label}</strong></span>
        <button type="button" className="tour-reset" onClick={onReset}><RotateCcw size={14} aria-hidden="true" /><span>Reset demo</span></button>
      </div>
      {TABS.map(({ key }) => <div key={key} className="tour-panel" role="tabpanel" id={`${id}-${key}-panel`} aria-labelledby={`${id}-${key}`} hidden={active !== key} tabIndex={0}>
        {key === "reviews" ? <ReviewDemo /> : key === "requests" ? <RequestDemo /> : <ReportDemo />}
      </div>)}
      </div>
      <div className="tour-sandbox-note"><ShieldCheck size={15} aria-hidden="true" /><p>Yours to explore. Fictional data, sample replies, no real sends.</p></div>
    </div>
  );
}
