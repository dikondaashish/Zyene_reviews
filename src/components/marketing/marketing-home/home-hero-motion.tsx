"use client";

import type { PointerEvent, ReactNode } from "react";
import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { MarketingAnimation } from "@/components/marketing/marketing-animation";

export function HomeHeroMotion({ content, scene }: { content: ReactNode; scene: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const copyY = useTransform(scrollY, [0, 450], [0, -10]);
  const sceneY = useTransform(scrollY, [0, 450], [0, -15]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.8 });
  const y = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.8 });

  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (
      reduceMotion ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(min-width:1200px) and (pointer:fine)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(Math.max(-2, Math.min(2, ((event.clientX - bounds.left) / bounds.width - 0.5) * 4)));
    pointerY.set(Math.max(-2, Math.min(2, ((event.clientY - bounds.top) / bounds.height - 0.5) * 4)));
  }

  return (
    <MarketingAnimation>
      <div className="home-hero-main">
        <m.div className="home-hero-copy-layer" style={{ y: reduceMotion ? 0 : copyY }}>
          {content}
        </m.div>
        <m.div
          className="home-hero-scene-layer"
          style={{ y: reduceMotion ? 0 : sceneY }}
          onPointerMove={moveScene}
          onPointerLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
          }}
        >
          <m.div
            className="home-hero-pointer-layer"
            style={{ x: reduceMotion ? 0 : x, y: reduceMotion ? 0 : y }}
          >
            {scene}
          </m.div>
        </m.div>
      </div>
    </MarketingAnimation>
  );
}
