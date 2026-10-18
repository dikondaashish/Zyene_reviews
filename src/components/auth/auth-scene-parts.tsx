import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";
import { GoogleCardGoogleIcon } from "@/components/integrations/google-card-google-icon";
import { YelpCardIcon } from "@/components/integrations/yelp-card-icon";

export type ScenePlatform = "google" | "facebook" | "yelp";

const PLATFORM_LABEL: Record<ScenePlatform, string> = { google: "Google", facebook: "Facebook", yelp: "Yelp" };

/** Sets the entrance delay (seconds) that the flow's `fx-*` classes read. */
export const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** Five stars; `pop` makes them land one after another, starting at `delay` seconds. */
export function SceneStars({ count = 5, delay = 0, size = 12, pop = false }: { count?: number; delay?: number; size?: number; pop?: boolean }) {
    return (
        <span className="scene-stars">
            {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={size} fill="currentColor" strokeWidth={0}
                    className={`${i < count ? "" : "scene-star-off"} ${pop ? "fx-star" : ""}`}
                    style={pop ? d(delay + i * 0.07) : undefined} />
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

/** Initials avatar tinted by the review's platform. */
export function SceneAvatar({ initials, platform }: { initials: string; platform?: ScenePlatform }) {
    return <span className={`scene-avatar ${platform ? `scene-tint--${platform}` : ""}`}>{initials}</span>;
}
