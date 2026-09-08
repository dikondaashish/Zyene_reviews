"use client";

// Adapted from Motion Primitives' Tilt on 21st.dev (MIT).
// Copyright (c) 2024 ibelick. See docs/marketing-component-licenses.md.
import type { PointerEvent, ReactNode } from "react";
import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export function MarketingTilt({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const ySpring = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [1.8, -1.8]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-1.8, 1.8]);
  const transform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      reducedMotion ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div
      className={className}
      data-marketing-tilt
      style={{ transform }}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </m.div>
  );
}
