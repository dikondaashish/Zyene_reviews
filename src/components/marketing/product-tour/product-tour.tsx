"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { BarChart3, Coffee, MessageSquare, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { ReviewDemo } from "@/components/marketing/product-tour/review-demo";
import { RequestDemo } from "@/components/marketing/product-tour/request-demo";
import { ReportDemo } from "@/components/marketing/product-tour/report-demo";

const TABS = [
  { key: "reviews", label: "Reviews & replies", icon: MessageSquare },
  { key: "requests", label: "Review requests", icon: Send },
  { key: "reports", label: "Reporting", icon: BarChart3 },
] as const;
export type ProductTourTab = (typeof TABS)[number]["key"];

export function ProductTour({ initialTab = "reviews" }: { initialTab?: ProductTourTab }) {
  const [version, setVersion] = useState(0);
  return <ProductTourSession key={version} initialTab={initialTab} onReset={() => setVersion(value => value + 1)} />;
}

function ProductTourSession({ initialTab, onReset }: { initialTab: ProductTourTab; onReset: () => void }) {
  const [active, setActive] = useState<ProductTourTab>(initialTab);
  const [pointerMotion, setPointerMotion] = useState(false);
  const id = useId();
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % TABS.length
      : event.key === "ArrowLeft" ? (index + TABS.length - 1) % TABS.length
        : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActive(TABS[next].key);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  }
  return (
    <div className="product-tour" data-pointer-motion={pointerMotion} onPointerDownCapture={() => setPointerMotion(true)} onKeyDownCapture={() => setPointerMotion(false)}>
      <div className="tour-toolbar">
        <span className="tour-wordmark">Zyene<span>Reviews</span></span>
        <span className="tour-business"><Coffee size={17} aria-hidden="true" /><span>Juniper Coffee<small>Example workspace</small></span></span>
        <button type="button" className="tour-reset" onClick={onReset}><RotateCcw size={14} aria-hidden="true" /><span>Reset demo</span></button>
      </div>
      <div className="tour-tabs" role="tablist" aria-label="Explore Zyene">
        {TABS.map(({ key, label, icon: Icon }, index) => <button key={key} type="button" role="tab" id={`${id}-${key}`} aria-selected={active === key} aria-controls={`${id}-${key}-panel`} tabIndex={active === key ? 0 : -1} onClick={() => setActive(key)} onKeyDown={event => onKeyDown(event, index)}><Icon size={17} aria-hidden="true" />{label}</button>)}
      </div>
      {TABS.map(({ key }) => <div key={key} className="tour-panel" role="tabpanel" id={`${id}-${key}-panel`} aria-labelledby={`${id}-${key}`} hidden={active !== key} tabIndex={0}>
        {key === "reviews" ? <ReviewDemo /> : key === "requests" ? <RequestDemo /> : <ReportDemo />}
      </div>)}
      <div className="tour-sandbox-note"><ShieldCheck size={15} aria-hidden="true" /><p>Yours to explore. Fictional data, sample replies, no real sends.</p></div>
    </div>
  );
}
