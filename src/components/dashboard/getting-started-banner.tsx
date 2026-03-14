"use client";

import { useState } from "react";
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
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("getting-started-dismissed") === "true";
  });

  const isHydrated = typeof window !== "undefined";

  if (!isHydrated || isDismissed) return null;

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
    <div className="relative overflow-hidden bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete these steps to unlock the full power of Zyene Reviews
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">
            Progress: {completedCount} of {items.length} completed
          </span>
          <span className="text-xs font-semibold text-indigo-600">
            {Math.round(completionPercent)}%
          </span>
        </div>
        <Progress value={completionPercent} className="h-1.5" />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <Link key={index} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${item.done
                ? "bg-green-50/50 hover:bg-green-100/50"
                : "bg-white hover:bg-gray-50"
                }`}
            >
              <div
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.done
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300"
                  }`}
              >
                {item.done && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className={`text-sm font-medium ${item.done ? "text-green-700" : "text-gray-700"}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
