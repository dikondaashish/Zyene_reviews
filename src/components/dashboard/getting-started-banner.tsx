"use client";

import { useState, useEffect } from "react";
import { X, Check, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useDashboardTour } from "@/components/tours/DashboardTourProvider";
import { Button } from "@/components/ui/button";

interface GettingStartedBannerProps {
  googleConnected: boolean;
  customerCount: number;
  requestSent: boolean;
  notificationsConfigured: boolean;
}

export function GettingStartedBanner({
  googleConnected,
  customerCount,
  requestSent,
  notificationsConfigured,
}: GettingStartedBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { startTour } = useDashboardTour();

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("getting-started-dismissed") === "true";
    setIsDismissed(dismissed);
  }, []);

  if (!mounted || isDismissed) return null;

  const items = [
    { label: "Connect Google Business Profile", done: googleConnected, href: "/settings/integrations" },
    { label: "Add your first customer", done: customerCount > 0, href: "/customers" },
    { label: "Send your first review request", done: requestSent, href: "/requests" },
    { label: "Set up notification preferences", done: notificationsConfigured, href: "/settings/notifications" },
  ];

  const completedCount = items.filter((item) => item.done).length;
  const completionPercent = (completedCount / items.length) * 100;

  const handleDismiss = () => {
    localStorage.setItem("getting-started-dismissed", "true");
    setIsDismissed(true);
  };

  return (
    <div className="relative overflow-hidden bg-card border border-border/50 rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Get Started</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these steps to unlock the full power of Zyene Reviews
          </p>
        </div>
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="h-8 gap-2 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all text-xs font-semibold"
          >
            <HelpCircle className="size-3.5" />
            Take a quick tour
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 mt-0.5"
            aria-label="Dismiss banner"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider">
          <span className="text-muted-foreground">
            Progress: {completedCount} of {items.length}
          </span>
          <span className="text-primary">
            {Math.round(completionPercent)}%
          </span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <Link key={index} href={item.href}>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${item.done
                ? "bg-chart-2/5 border-chart-2/30 text-chart-2 dark:text-chart-2"
                : "bg-background border-border hover:border-primary/30 pro-hover"
                }`}
            >
              <div
                className={`shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${item.done ? "border-chart-2 bg-chart-2" : "border-border bg-background" } size-6`}
              >
                {item.done ? (
                  <Check className="text-primary-foreground size-4" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm font-semibold truncate ${!item.done && "text-foreground"}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
