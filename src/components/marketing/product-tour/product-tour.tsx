"use client";

import { useId, useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { BarChart3, ChevronDown, MessageSquare, Send } from "lucide-react";
import { ReviewDemo } from "@/components/marketing/product-tour/review-demo";
import { RequestDemo } from "@/components/marketing/product-tour/request-demo";
import { AnimatedBackground } from "@/components/marketing/animated-background";
import { TransitionPanel } from "@/components/marketing/transition-panel";

const ReportDemo = dynamic(
  () =>
    import("@/components/marketing/product-tour/report-demo").then(
      (m) => m.ReportDemo,
    ),
  {
    loading: () => <p className="p-8">Loading example report…</p>,
  },
);
const TABS = [
  { key: "reviews", label: "Reviews & replies", icon: MessageSquare },
  { key: "requests", label: "Review requests", icon: Send },
  { key: "reports", label: "Reporting", icon: BarChart3 },
] as const;
export type ProductTourTab = (typeof TABS)[number]["key"];

export function ProductTour({
  initialTab = "reviews",
}: {
  initialTab?: ProductTourTab;
}) {
  const [active, setActive] = useState<ProductTourTab>(initialTab);
  const id = useId();
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % TABS.length
        : event.key === "ArrowLeft"
          ? (index + TABS.length - 1) % TABS.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? TABS.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(TABS[next].key);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("[role=tab]")
      [next]?.focus();
  }
  return (
    <div className="product-tour">
      <div className="tour-toolbar">
        <span className="tour-wordmark">
          zyene<span>reviews</span>
        </span>
        <span className="tour-business">
          Juniper Coffee <ChevronDown size={12} />
        </span>
        <span className="tour-example-label">Example workspace</span>
      </div>
      <div className="tour-tabs" role="tablist" aria-label="Explore Zyene">
        <AnimatedBackground value={active} className="tour-tab-highlight">
          {TABS.map(({ key, label, icon: Icon }, index) => (
            <button
              key={key}
              data-id={key}
              type="button"
              role="tab"
              id={`${id}-${key}`}
              aria-selected={active === key}
              aria-controls={`${id}-panel`}
              tabIndex={active === key ? 0 : -1}
              onClick={() => setActive(key)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </AnimatedBackground>
      </div>
      <div
        className="tour-panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${active}`}
        tabIndex={0}
      >
        <TransitionPanel activeKey={active}>
          {active === "reviews" ? (
            <ReviewDemo />
          ) : active === "requests" ? (
            <RequestDemo />
          ) : (
            <ReportDemo />
          )}
        </TransitionPanel>
      </div>
    </div>
  );
}
