import type { ReactNode } from "react";
import { BatteryFull, LockKeyhole, Wifi } from "lucide-react";

interface FeatureDemoFrameProps {
    children: ReactNode;
    label: string;
    caption?: string;
}

export function FeatureDemoFrame({ children, label, caption }: FeatureDemoFrameProps) {
    return (
        <figure className="tour-tablet-stage" role="group" aria-label={label}>
            <div className="tour-tablet">
                <span className="tour-tablet-camera" aria-hidden="true" />
                <span className="tour-tablet-power" aria-hidden="true" />
                <div className="tour-tablet-screen">
                    <div className="tour-tablet-status" aria-hidden="true">
                        <span>9:41</span>
                        <span><Wifi size={12} /><BatteryFull size={16} /></span>
                    </div>
                    <div className="tour-tablet-browser" aria-hidden="true">
                        <LockKeyhole size={10} />
                        <span>app.zyenereviews.com</span>
                        <span className="tour-tablet-live">Interactive sample</span>
                    </div>
                    {children}
                    <div className="tour-tablet-home" aria-hidden="true"><span /></div>
                </div>
            </div>
            {caption && <figcaption className="tour-tablet-caption"><span aria-hidden="true" />{caption}</figcaption>}
        </figure>
    );
}
