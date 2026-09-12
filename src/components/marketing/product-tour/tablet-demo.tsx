import type { ReactNode } from "react";
import { BatteryFull, LockKeyhole, Wifi } from "lucide-react";

export function TabletDemo({ children }: { children: ReactNode }) {
  return (
    <div className="tour-tablet-stage">
      <div className="tour-tablet">
        <span className="tour-tablet-camera" aria-hidden="true" />
        <span className="tour-tablet-power" aria-hidden="true" />
        <div className="tour-tablet-screen">
          <div className="tour-tablet-status" aria-hidden="true"><span>9:41</span><span><Wifi size={12} /><BatteryFull size={16} /></span></div>
          <div className="tour-tablet-browser" aria-hidden="true"><LockKeyhole size={10} /><span>app.zyenereviews.com</span><span className="tour-tablet-live">Interactive demo</span></div>
          {children}
          <div className="tour-tablet-home" aria-hidden="true"><span /></div>
        </div>
      </div>
      <p className="tour-tablet-caption"><span />Your workspace. Ready to try.</p>
    </div>
  );
}
