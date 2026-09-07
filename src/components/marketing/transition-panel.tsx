"use client";

// Adapted from Motion Primitives' Transition Panel on 21st.dev (MIT).
// Copyright (c) 2024 ibelick. See docs/marketing-component-licenses.md.
import { forwardRef, type ReactNode } from "react";
import {
  AnimatePresence,
  m,
  useIsPresent,
  useReducedMotion,
} from "framer-motion";

import { MarketingAnimation } from "@/components/marketing/marketing-animation";

const PanelContent = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function PanelContent({ children }, ref) {
    const present = useIsPresent();
    const reducedMotion = useReducedMotion();
    return (
      <m.div
        ref={ref}
        inert={!present}
        aria-hidden={!present || undefined}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
        transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
      >
        {children}
      </m.div>
    );
  },
);

export function TransitionPanel({
  activeKey,
  children,
}: {
  activeKey: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <MarketingAnimation>
        <AnimatePresence initial={false} mode="popLayout">
          <PanelContent key={activeKey}>{children}</PanelContent>
        </AnimatePresence>
      </MarketingAnimation>
    </div>
  );
}
