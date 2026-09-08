"use client";

import { useEffect, useState } from "react";

export function MarketingNavigationProgress({ label }: { label: string }) {
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowMessage(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="marketing-navigation-progress">
      <div className="marketing-navigation-track" role="progressbar" aria-label="Loading page">
        <span />
      </div>
      <div role="status" aria-live="polite" className={showMessage ? "marketing-navigation-message" : "sr-only"}>
        {showMessage ? label : ""}
      </div>
    </div>
  );
}
