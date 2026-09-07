"use client";

// Adapted from Motion Primitives' Animated Tabs on 21st.dev (MIT).
// Copyright (c) 2024 ibelick. See docs/marketing-component-licenses.md.
import {
  Children,
  cloneElement,
  useId,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { MarketingAnimation } from "@/components/marketing/marketing-animation";
import { cn } from "@/lib/utils";

type BackgroundButton = ReactElement<
  ButtonHTMLAttributes<HTMLButtonElement> & { "data-id": string }
>;

export function AnimatedBackground({
  children,
  value,
  className,
  groupId,
}: {
  children: BackgroundButton[];
  value: string | null;
  className?: string;
  groupId?: string;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();

  return (
    <MarketingAnimation>
      {Children.map(children, (child) =>
        cloneElement(
          child,
          {
            className: cn("animated-background-trigger", child.props.className),
          },
          <>
            <AnimatePresence initial={false}>
              {value === child.props["data-id"] && (
                <m.span
                  aria-hidden="true"
                  layoutId={
                    reducedMotion ? undefined : `background-${groupId ?? id}`
                  }
                  className={cn("animated-background", className)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: "spring", bounce: 0.12, duration: 0.28 }
                  }
                />
              )}
            </AnimatePresence>
            <span className="animated-background-label">
              {child.props.children}
            </span>
          </>,
        ),
      )}
    </MarketingAnimation>
  );
}
