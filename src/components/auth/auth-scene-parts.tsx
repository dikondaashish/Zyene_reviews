import type { CSSProperties, ReactNode } from "react";
import { Star } from "lucide-react";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";
import { GoogleCardGoogleIcon } from "@/components/integrations/google-card-google-icon";
import { YelpCardIcon } from "@/components/integrations/yelp-card-icon";

export type ScenePlatform = "google" | "facebook" | "yelp";

const PLATFORM_LABEL: Record<ScenePlatform, string> = { google: "Google", facebook: "Facebook", yelp: "Yelp" };

/** Five stars that pop in one after another, starting at `delay` seconds. */
export function SceneStars({ delay = 0, size = 12 }: { delay?: number; size?: number }) {
    return (
        <span className="scene-stars">
            {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={size} fill="currentColor" strokeWidth={0}
                    style={{ "--scene-delay": `${delay + i * 0.08}s` } as CSSProperties} />
            ))}
        </span>
    );
}

export function PlatformMark({ platform }: { platform: ScenePlatform }) {
    return (
        <span className={`scene-platform scene-platform--${platform}`}>
            {platform === "google" && <GoogleCardGoogleIcon />}
            {platform === "facebook" && <FacebookBrandIcon aria-hidden="true" />}
            {platform === "yelp" && <YelpCardIcon className="scene-yelp-icon" />}
            {PLATFORM_LABEL[platform]}
        </span>
    );
}

interface SceneReviewCardProps {
    platform: ScenePlatform;
    initials: string;
    name: string;
    delay: number;
    className: string;
    children: ReactNode;
}

/** A review arriving: the outer element floats, the inner card handles the entrance. */
export function SceneReviewCard({ platform, initials, name, delay, className, children }: SceneReviewCardProps) {
    return (
        <div className={`scene-float ${className}`}>
            <div className="scene-card scene-enter" style={{ "--scene-delay": `${delay}s` } as CSSProperties}>
                <div className="scene-card-head">
                    <span className="scene-avatar">{initials}</span>
                    <span className="scene-card-who"><strong>{name}</strong><PlatformMark platform={platform} /></span>
                    <SceneStars delay={delay + 0.35} />
                </div>
                <p>{children}</p>
            </div>
        </div>
    );
}
