"use client";

import type { PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

/** Keeps pointer and scroll motion scoped to the decorative product scene. */
export function HomeHeroSceneMotion({ children }: { children: ReactNode }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateScrollOffset = () => {
      if (reducedMotion.matches) return;
      scene.style.setProperty(
        "--home-hero-scroll-y",
        `${Math.max(-15, -(window.scrollY / 30))}px`,
      );
    };
    const updatePreference = () => {
      reduceMotionRef.current = reducedMotion.matches;
      scene.style.removeProperty("--home-hero-scroll-y");
      scene.style.removeProperty("--home-hero-pointer-x");
      scene.style.removeProperty("--home-hero-pointer-y");
      updateScrollOffset();
    };

    updatePreference();
    window.addEventListener("scroll", updateScrollOffset, { passive: true });
    reducedMotion.addEventListener("change", updatePreference);
    return () => {
      window.removeEventListener("scroll", updateScrollOffset);
      reducedMotion.removeEventListener("change", updatePreference);
    };
  }, []);

  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (
      reduceMotionRef.current ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(min-width:1200px) and (pointer:fine)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    event.currentTarget.style.setProperty(
      "--home-hero-pointer-x",
      `${Math.max(-2, Math.min(2, ((event.clientX - bounds.left) / bounds.width - 0.5) * 4))}px`,
    );
    event.currentTarget.style.setProperty(
      "--home-hero-pointer-y",
      `${Math.max(-2, Math.min(2, ((event.clientY - bounds.top) / bounds.height - 0.5) * 4))}px`,
    );
  }

  return (
    <div
      ref={sceneRef}
      className="home-hero-scene-layer"
      onPointerMove={moveScene}
      onPointerLeave={(event) => {
        event.currentTarget.style.removeProperty("--home-hero-pointer-x");
        event.currentTarget.style.removeProperty("--home-hero-pointer-y");
      }}
    >
      <div className="home-hero-pointer-layer">{children}</div>
    </div>
  );
}
