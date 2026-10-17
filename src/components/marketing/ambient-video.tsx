"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/use-in-view";

/**
 * A muted, looping product-story clip. Nothing downloads until it nears the viewport, it pauses
 * offscreen, and with reduced motion only the poster is shown. The clip has no audio track.
 */
export function AmbientVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const [wrapRef, inView] = useInView<HTMLDivElement>(0.2);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!inView || reduceMotion) {
      video.pause();
      return;
    }
    if (!video.getAttribute("src")) video.setAttribute("src", src);
    video.play().catch(() => {
      // Autoplay can be refused (low-power mode); the poster stays visible.
    });
  }, [inView, src]);

  return (
    <div ref={wrapRef} className={className}>
      <video ref={videoRef} poster={poster} muted loop playsInline preload="none" aria-label={label} />
    </div>
  );
}
