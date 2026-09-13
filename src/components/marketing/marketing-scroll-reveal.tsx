"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealIntensity = "subtle" | "standard" | "prominent";

const PARALLAX_DISTANCE: Record<RevealIntensity, number> = {
  subtle: 6,
  standard: 10,
  prominent: 14,
};

export function MarketingScrollReveal({
  children,
  className = "",
  delay = 0,
  intensity = "standard",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  intensity?: RevealIntensity;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const distance = PARALLAX_DISTANCE[intensity];
    let frame = 0;
    const updatePosition = () => {
      frame = 0;
      if (reducedMotion.matches) return;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
      section.style.setProperty("--marketing-scroll-y", `${(0.5 - progress) * distance * 2}px`);
    };
    const schedulePosition = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePosition);
    };
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        reveal.disconnect();
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.08 },
    );
    const updatePreference = () => {
      section.style.removeProperty("--marketing-scroll-y");
      if (reducedMotion.matches) setIsVisible(true);
      schedulePosition();
    };

    const mountFrame = window.requestAnimationFrame(() => {
      setMounted(true);
      updatePreference();
      reveal.observe(section);
    });
    window.addEventListener("scroll", schedulePosition, { passive: true });
    window.addEventListener("resize", schedulePosition);
    reducedMotion.addEventListener("change", updatePreference);
    return () => {
      window.cancelAnimationFrame(mountFrame);
      window.cancelAnimationFrame(frame);
      reveal.disconnect();
      window.removeEventListener("scroll", schedulePosition);
      window.removeEventListener("resize", schedulePosition);
      reducedMotion.removeEventListener("change", updatePreference);
    };
  }, [intensity]);

  return (
    <div
      ref={sectionRef}
      className={`marketing-scroll-reveal ${className}`.trim()}
      data-scroll-mounted={mounted}
      data-scroll-visible={isVisible}
    >
      <div
        className="marketing-scroll-reveal-content"
        style={{ "--scroll-delay": `${delay}ms` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
