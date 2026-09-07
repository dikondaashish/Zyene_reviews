"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MarketingMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          animations.push(
            entry.target.animate(
              [
                { opacity: 0.5, transform: "translateY(24px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" },
            ),
          );
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".marketing-site [data-reveal]").forEach((element) => observer.observe(element));
    const stopMotion = () => {
      if (preference.matches) {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
      }
    };
    preference.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stopMotion);
    };
  }, [pathname]);
  return null;
}
