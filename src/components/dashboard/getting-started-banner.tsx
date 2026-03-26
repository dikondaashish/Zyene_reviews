"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

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

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("getting-started-dismissed") === "true";
    setIsDismissed(dismissed);
  }, []);

  if (!mounted || isDismissed) return null;

  const items = [
    { label: "Connect Google Business Profile", done: googleConnected, href: "/integrations" },
    { label: "Add your first customer", done: customerCount > 0, href: "/customers" },
    { label: "Send your first review request", done: requestSent, href: "/requests" },
    { label: "Set up notification preferences", done: notificationsConfigured, href: "/settings?tab=notifications" },
  ];

  const completedCount = items.filter((item) => item.done).length;
  const completionPercent = (completedCount / items.length) * 100;

  const handleDismiss = () => {
    localStorage.setItem("getting-started-dismissed", "true");
    setIsDismissed(true);
  };

  return (
    <div className="relative overflow-hidden bg-card border border-border/50 rounded-2xl p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Get Started</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these steps to unlock the full power of Zyene Reviews
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
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
                ? "bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400"
                : "bg-background border-border hover:border-primary/30 pro-hover"
                }`}
            >
              <div
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.done
                  ? "border-green-500 bg-green-500"
                  : "border-border bg-background"
                  }`}
              >
                {item.done ? (
                  <Check className="h-4 w-4 text-white" />
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
