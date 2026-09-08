"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { getMarketingNavigationTarget, isMarketingNavigationClick } from "@/lib/marketing/navigation";

export function useMarketingNavigation() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("Opening page…");

  function onClickCapture(event: MouseEvent<HTMLElement>) {
    if (!isMarketingNavigationClick(event)) return;
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("data-native-navigation")) return;
    const target = getMarketingNavigationTarget(anchor.href, window.location.href);
    if (!target) return;
    event.preventDefault();
    setLabel(target.label);
    startTransition(() => router.push(target.href));
  }

  return { pending, label, onClickCapture };
}
