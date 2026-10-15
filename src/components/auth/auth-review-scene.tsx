import type { CSSProperties } from "react";
import { BellRing, CheckCheck, Sparkles, Star, TrendingUp } from "lucide-react";
import { PlatformMark, SceneReviewCard } from "@/components/auth/auth-scene-parts";
import "@/components/auth/auth-scene.css";

const delay = (seconds: number) => ({ "--scene-delay": `${seconds}s` }) as CSSProperties;

const REPLY = "Thanks, Marco! We’ll save you a seat next Tuesday.".split(" ");

const SPARKS = [
    { left: "12%", delay: 0.4, size: 10 },
    { left: "34%", delay: 2.6, size: 8 },
    { left: "58%", delay: 1.3, size: 12 },
    { left: "76%", delay: 3.8, size: 9 },
    { left: "90%", delay: 0.9, size: 7 },
];

function RatingCard() {
    return (
        <div className="scene-float scene-float--rating">
            <div className="scene-card scene-rating scene-enter" style={delay(0.1)}>
                <span className="scene-label">Average rating</span>
                <div className="scene-rating-row">
                    <span className="scene-rating-value">4.</span>
                    <span className="scene-rating-stars">
                        <span className="scene-rating-track">
                            {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />)}
                        </span>
                        <span className="scene-rating-fill">
                            {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />)}
                        </span>
                    </span>
                </div>
                <svg className="scene-spark-line" viewBox="0 0 160 44" preserveAspectRatio="none">
                    <path className="scene-spark-area" d="M0 38 L20 34 L40 36 L60 26 L80 28 L100 18 L120 20 L140 9 L160 6 L160 44 L0 44 Z" />
                    <path className="scene-spark-stroke" pathLength={1} d="M0 38 L20 34 L40 36 L60 26 L80 28 L100 18 L120 20 L140 9 L160 6" />
                </svg>
                <span className="scene-trend"><TrendingUp size={13} /> +126 reviews this quarter</span>
            </div>
        </div>
    );
}

function ReplyBubble() {
    return (
        <div className="scene-float scene-float--reply">
            <div className="scene-reply scene-enter" style={delay(1.7)}>
                <span className="scene-reply-label"><Sparkles size={13} /> Reply drafted in your voice</span>
                <span className="scene-typing"><i /><i /><i /></span>
                <p className="scene-reply-text">
                    {REPLY.map((word, i) => <span key={word} style={{ "--word": i } as CSSProperties}>{word} </span>)}
                </p>
                <span className="scene-posted"><CheckCheck size={13} /> Posted to Yelp</span>
            </div>
        </div>
    );
}

/** Decorative, CSS-only illustration of reviews arriving and being answered. */
export function AuthReviewScene() {
    return (
        <div className="auth-scene" aria-hidden="true">
            <span className="scene-glow" />
            <div className="scene-toast">
                <BellRing size={13} /> New 5★ review <PlatformMark platform="google" /> <em>just now</em>
            </div>
            <RatingCard />
            <SceneReviewCard platform="google" initials="PS" name="Priya S." delay={0.55} className="scene-float--google">
                Booked online in a minute and the whole team was lovely.
            </SceneReviewCard>
            <SceneReviewCard platform="yelp" initials="MD" name="Marco D." delay={1.1} className="scene-float--yelp">
                Best tacos on the block. Fast, friendly, fresh.
            </SceneReviewCard>
            <ReplyBubble />
            <SceneReviewCard platform="facebook" initials="LK" name="Lena K." delay={2.1} className="scene-float--facebook">
                Our go-to spot for birthdays. Recommended!
            </SceneReviewCard>
            {SPARKS.map((spark) => (
                <Star key={spark.left} className="scene-spark" size={spark.size} fill="currentColor" strokeWidth={0}
                    style={{ left: spark.left, ...delay(spark.delay) }} />
            ))}
        </div>
    );
}
