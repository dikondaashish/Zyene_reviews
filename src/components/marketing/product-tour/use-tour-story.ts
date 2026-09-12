"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductTourTab } from "@/components/marketing/product-tour/product-tour";

const CHAPTERS: ProductTourTab[] = ["reviews", "requests", "reports"];

export function useTourStory(initialTab: ProductTourTab) {
  const section = useRef<HTMLElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(initialTab);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    element.dataset.ready = "true";
    const enabled = window.matchMedia("(min-width: 1100px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let lastChapter = -1;
    let lastScroll = window.scrollY;
    function update() {
      frame = 0;
      if (!element || !enabled.matches) return;
      const rect = element.getBoundingClientRect();
      const distance = Math.max(1, element.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / distance));
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${progress})`;
      const chapter = Math.min(2, Math.floor(progress * 3));
      const moved = Math.abs(window.scrollY - lastScroll) > 1;
      lastScroll = window.scrollY;
      if (chapter === lastChapter) return;
      const focused = document.activeElement;
      // Keep unfinished typing visible, while ordinary tab clicks still allow scroll exploration.
      const editing = focused instanceof HTMLElement && element.contains(focused)
        && focused.matches('input, textarea, select, [contenteditable="true"]');
      if (lastChapter !== -1 && moved && !editing && rect.top < 100 && rect.bottom > 100) setActive(CHAPTERS[chapter]);
      lastChapter = chapter;
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    enabled.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      enabled.removeEventListener("change", schedule);
    };
  }, []);
  return { section, progressBar, active, setActive };
}
