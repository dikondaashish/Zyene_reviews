"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

/**
 * Marks its children with data-inview so CSS can start (and pause) their animations
 * only while they are on screen. Content is fully visible without it.
 */
export function InViewPlay({ children, className, threshold = 0.25 }: { children: ReactNode; className?: string; threshold?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(threshold);
  return (
    <div ref={ref} className={className} data-inview={inView ? "true" : "false"}>
      {children}
    </div>
  );
}
