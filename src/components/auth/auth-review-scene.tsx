import type { CSSProperties } from "react";
import { BellRing, CheckCheck, MessageSquareText, Sparkles, Star, TrendingUp } from "lucide-react";
import { PlatformMark, SceneReviewCard } from "@/components/auth/auth-scene-parts";
import "@/components/auth/auth-scene.css";

const delay = (seconds: number) => ({ "--scene-delay": `${seconds}s` }) as CSSProperties;

const REPLY = "Thanks, Marco! We’ll save you a seat next Tuesday.".split(" ");

const SPARKS = [
    { left: "8%", delay: 0.4, size: 10, tone: "amber" },
    { left: "30%", delay: 2.6, size: 8, tone: "mint" },
    { left: "52%", delay: 1.3, size: 12, tone: "orange" },
    { left: "72%", delay: 3.8, size: 9, tone: "blue" },
    { left: "88%", delay: 0.9, size: 7, tone: "amber" },
];

function RatingCard() {
    const stars = [0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />);
    return (
        <div className="scene-float scene-float--rating">
            <div className="scene-card scene-rating scene-enter" style={delay(0.1)}>
                <span className="scene-label">Average rating</span>
                <div className="scene-rating-row">
                    <span className="scene-rating-value">4.</span>
                    <span className="scene-rating-stars">
                        <span className="scene-rating-track">{stars}</span>
                        <span className="scene-rating-fill">{stars}</span>
                    </span>
                </div>
                <svg className="scene-spark-line" viewBox="0 0 160 44" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="scene-trend-stroke" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0" stopColor="var(--primary)" />
                            <stop offset="1" stopColor="var(--chart-4)" />
                        </linearGradient>
                    </defs>
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

/** Two app moments that take turns: a review request going out, then a review coming in. */
function SceneToasts() {
    return (
        <>
            <div className="scene-toast scene-toast--request">
                <MessageSquareText size={13} /> Review request sent by SMS <em>to Marco</em>
            </div>
            <div className="scene-toast scene-toast--review">
                <BellRing size={13} /> New 5★ review <PlatformMark platform="google" /> <em>just now</em>
            </div>
        </>
    );
}

/** Decorative, CSS-only illustration of reviews arriving and being answered. */
export function AuthReviewScene() {
    return (
        <div className="auth-scene" aria-hidden="true">
            <SceneToasts />
            <RatingCard />
            <SceneReviewCard platform="google" initials="PS" name="Priya S." delay={0.55} className="scene-float--google">
                Booked online in a minute and the whole team was lovely.
            </SceneReviewCard>
            <SceneReviewCard platform="yelp" initials="MD" name="Marco D." delay={1.1} className="scene-float--yelp" tag="Positive">
                Best tacos on the block. Fast, friendly, fresh.
            </SceneReviewCard>
            <ReplyBubble />
            <SceneReviewCard platform="facebook" initials="LK" name="Lena K." delay={2.1} className="scene-float--facebook">
                Our go-to spot for birthdays. Recommended!
            </SceneReviewCard>
            {SPARKS.map((spark) => (
                <Star key={spark.left} className={`scene-spark scene-spark--${spark.tone}`} size={spark.size}
                    fill="currentColor" strokeWidth={0} style={{ left: spark.left, ...delay(spark.delay) }} />
            ))}
        </div>
    );
}
