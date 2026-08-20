"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

function launchConfetti() {
  const duration = 5_000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

function celebrate(milestone: number) {
  launchConfetti();
  toast.custom(
    (id) => (
      <div className="pointer-events-auto flex w-[calc(100vw-1rem)] min-w-0 max-w-[420px] flex-col overflow-hidden rounded-xl border-2 border-primary bg-background shadow-2xl ring-1 ring-black/5 sm:flex-row sm:rounded-2xl">
        <div className="flex-1 p-4">
          <div className="flex items-start">
            <div className="rounded-full bg-primary/20 p-2">
              <Trophy className="text-primary size-6" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-foreground">Milestone achieved!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You&apos;ve reached {milestone.toLocaleString()} total reviews.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-muted/50 sm:border-l sm:border-t-0">
          <button
            type="button"
            onClick={() => toast.dismiss(id)}
            className="flex min-h-11 w-full items-center justify-center p-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus:outline-none sm:rounded-r-2xl"
          >
            Awesome!
          </button>
        </div>
      </div>
    ),
    { duration: 6_000 },
  );
}

export function MilestoneCelebration({
  businessId,
  isDemo,
}: {
  businessId: string;
  isDemo?: boolean;
}) {
  useEffect(() => {
    if (isDemo || !businessId) return;
    const controller = new AbortController();

    void fetch("/api/milestones/reviews/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as {
          data?: { milestone?: number | null };
        };
        return payload.data?.milestone ?? null;
      })
      .then((milestone) => {
        if (typeof milestone === "number" && !controller.signal.aborted) celebrate(milestone);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [businessId, isDemo]);

  return null;
}
