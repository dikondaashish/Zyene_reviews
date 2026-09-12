"use client";

import { useEffect, useRef, useState } from "react";

/** A cancellable, local-only typing preview. The underlying draft stays complete. */
export function useDemoTyping() {
  const [preview, setPreview] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setPreview(null);
  };
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  function start(text: string, animate = true) {
    cancel();
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let count = 0;
    setPreview("");
    const tick = () => {
      count = Math.min(text.length, count + 3);
      if (count === text.length) { cancel(); return; }
      setPreview(text.slice(0, count));
      timer.current = setTimeout(tick, 24);
    };
    timer.current = setTimeout(tick, 160);
  }
  return { preview, typing: preview !== null, start, cancel };
}
