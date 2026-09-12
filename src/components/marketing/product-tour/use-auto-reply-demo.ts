"use client";

import { useState } from "react";
import { useDemoTyping } from "@/components/marketing/product-tour/use-demo-typing";
import { AUTO_REPLY_SAMPLES } from "@/lib/marketing/auto-reply-demo-data";
import type { DemoAutoResult, DemoAutoSettings } from "@/types/marketing-product-demo";

export function useAutoReplyDemo() {
  const [settings, setSettings] = useState<DemoAutoSettings>({ enabled: false, minRating: 4, tone: "professional", rating: 4 });
  const [result, setResult] = useState<DemoAutoResult | null>(null);
  const { preview, start, cancel } = useDemoTyping();
  function configure(update: Partial<DemoAutoSettings>) {
    cancel();
    setResult(null);
    setSettings(current => ({ ...current, ...update }));
  }
  function simulate(config = settings, animate = true) {
    cancel();
    if (!config.enabled) return;
    const sample = AUTO_REPLY_SAMPLES[config.rating];
    const next = { rating: config.rating, review: sample.review, reply: sample.replies[config.tone] };
    if (config.rating < config.minRating) { setResult({ ...next, status: "skipped" }); return; }
    setResult({ ...next, status: "typing" });
    start(next.reply, animate, () => setResult({ ...next, status: "published" }));
  }
  function toggle(animate: boolean) {
    const next = { ...settings, enabled: !settings.enabled };
    configure(next);
    if (next.enabled) simulate(next, animate);
  }
  return { settings, result, preview, configure, simulate, toggle };
}
