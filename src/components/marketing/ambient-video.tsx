"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * A muted, looping product-story clip. Nothing downloads until it nears the viewport, it pauses
 * offscreen, and with reduced motion only the poster is shown. The clip has no audio track.
 * A pause/play toggle satisfies WCAG 2.2.2 (moving content longer than 5s must be pausable).
 */
export function AmbientVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const [wrapRef, inView] = useInView<HTMLDivElement>(0.2);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!inView || reduceMotion || userPaused) {
      video.pause();
      return;
    }
    if (!video.getAttribute("src")) video.setAttribute("src", src);
    video.play().catch(() => {
      // Autoplay can be refused (low-power mode); the poster stays visible.
    });
  }, [inView, src, reduceMotion, userPaused]);

  return (
    <div ref={wrapRef} className={className}>
      <video ref={videoRef} poster={poster} muted loop playsInline preload="none" aria-label={label} />
      {reduceMotion ? null : (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          // Fixed name + aria-pressed is the ARIA toggle pattern: "Pause video, pressed" = paused.
          aria-label="Pause video"
          aria-pressed={userPaused}
          title={userPaused ? "Play video" : "Pause video"}
          className="absolute bottom-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
