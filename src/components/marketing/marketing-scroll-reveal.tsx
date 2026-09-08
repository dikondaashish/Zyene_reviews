"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MarketingAnimation } from "@/components/marketing/marketing-animation";

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
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.08,
    margin: "0px 0px -4% 0px",
  });
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const distance = PARALLAX_DISTANCE[intensity];
  const scrollY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [distance, 0, -distance],
  );
  const parallaxY = useSpring(scrollY, {
    stiffness: 90,
    damping: 24,
    mass: 0.7,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    sectionRef.current?.setAttribute("data-scroll-mounted", "true");
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <MarketingAnimation>
      <m.div
        ref={sectionRef}
        className={`marketing-scroll-reveal ${className}`.trim()}
        data-scroll-visible={String(mounted && (reducedMotion || isInView))}
        style={{ y: parallaxY }}
      >
        <div
          className="marketing-scroll-reveal-content"
          style={{ "--scroll-delay": `${delay}ms` } as CSSProperties}
        >
          {children}
        </div>
      </m.div>
    </MarketingAnimation>
  );
}
