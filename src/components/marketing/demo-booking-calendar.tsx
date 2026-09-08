"use client";

import { useEffect, useState } from "react";

export function DemoBookingCalendar({ src }: { src: string }) {
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setSlow(true), 10000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <div>
      <div className="demo-calendar-frame" aria-busy={loading}>
        {loading && (
          <div className="demo-calendar-loading" role="status">
            <span className="demo-calendar-spinner" aria-hidden="true" />
            <p>{slow ? "The calendar is taking a little longer." : "Loading available times…"}</p>
            <p className="text-sm text-muted-foreground">{slow ? "Use the booking link below, or send us your details." : "You can also send your details using the demo form."}</p>
          </div>
        )}
        <iframe
          src={src}
          title="Schedule a Zyene Reviews demo on Cal.com"
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          className="w-full min-h-[520px] rounded-xl"
          onLoad={() => setLoading(false)}
          onError={() => setSlow(true)}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Prefer a separate window?{" "}
        <a href="https://cal.com/zyene/30-min-meeting" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-4">
          Open the booking page
        </a>
      </p>
    </div>
  );
}
