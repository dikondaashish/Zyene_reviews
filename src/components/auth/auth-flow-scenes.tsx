import type { CSSProperties } from "react";
import { Check, CheckCheck, Sparkles, Star } from "lucide-react";
import { PlatformMark, SceneAvatar, SceneStars, d, type ScenePlatform } from "@/components/auth/auth-scene-parts";

/* Decorative scenes for the auth flow. Each `fx-*` element animates in when its scene becomes active; resting styles are the final frame. */

export function RequestScene() {
    return (
        <div className="flow-frame">
            <div className="flow-channels fx-in" style={d(0.05)}>
                {["SMS", "Email", "QR code", "Link"].map((channel, i) => <span key={channel} data-on={i === 0 || undefined}>{channel}</span>)}
            </div>
            <div className="flow-card flow-thread fx-in" style={d(0.15)}>
                <div className="flow-thread-head">
                    <span className="flow-logo">CL</span>
                    <span><strong>Casa Lupe</strong><small>Text message · 7:42 PM</small></span>
                </div>
                <div className="flow-bubble flow-bubble--out fx-pop" style={d(0.55)}>
                    Hi Dave, thanks for coming in tonight! Got 30 seconds to tell us how it went?
                    <span className="flow-bubble-link"><Star size={12} fill="currentColor" strokeWidth={0} /> Leave a review</span>
                </div>
                <span className="flow-delivered fx-fade" style={d(1.2)}><CheckCheck size={13} /> Delivered</span>
                <div className="flow-incoming">
                    <span className="flow-typing fx-typing" style={d(1.6)}><i /><i /><i /></span>
                    <div className="flow-bubble flow-bubble--in fx-pop" style={d(2.6)}>Done! The carnitas were unreal.</div>
                </div>
            </div>
        </div>
    );
}

const INBOX: { platform: ScenePlatform; name: string; initials: string; stars: number; text: string; time: string }[] = [
    { platform: "google", name: "Brenda Kowalski", initials: "BK", stars: 5, text: "Only waited 10 min on a Friday night.", time: "now" },
    { platform: "facebook", name: "Gary Thompson", initials: "GT", stars: 5, text: "Best margaritas in town, hands down.", time: "6m" },
    { platform: "yelp", name: "Mike Delgado", initials: "MD", stars: 4, text: "Great tacos. Parking is a little tight.", time: "14m" },
];

export function InboxScene() {
    return (
        <div className="flow-frame">
            <div className="flow-card flow-inbox fx-in" style={d(0.05)}>
                <div className="flow-inbox-head">
                    <strong>Reviews</strong>
                    <span className="flow-badge fx-pop" style={d(1.7)}>3 new</span>
                </div>
                <div className="flow-filter"><span data-on>All</span><span>Google</span><span>Facebook</span><span>Yelp</span></div>
                <ul className="flow-inbox-list">
                    {INBOX.map((row, i) => (
                        <li key={row.name} className="flow-inbox-row fx-drop" style={d(1.15 - i * 0.35)}>
                            <SceneAvatar initials={row.initials} platform={row.platform} />
                            <span className="flow-inbox-body">
                                <span className="flow-inbox-top"><strong>{row.name}</strong><SceneStars count={row.stars} size={11} /></span>
                                <span className="flow-inbox-text">{row.text}</span>
                                <span className="flow-inbox-meta"><PlatformMark platform={row.platform} /> · {row.time}</span>
                            </span>
                            {i === 0 && <span className="flow-unread" />}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const REPLY = "Thanks Brenda! Glad the wait was short on a busy Friday. The corner booth is yours next time.".split(" ");

export function ReplyScene() {
    return (
        <div className="flow-frame">
            <div className="flow-card flow-review-mini fx-in" style={d(0.05)}>
                <SceneAvatar initials="BK" platform="google" />
                <span className="flow-inbox-body">
                    <span className="flow-inbox-top"><strong>Brenda Kowalski</strong><SceneStars size={11} /></span>
                    <span className="flow-inbox-text">Only waited 10 min on a Friday night and the food came out hot.</span>
                </span>
            </div>
            <div className="flow-card flow-composer fx-in" style={d(0.3)}>
                <div className="flow-composer-head">
                    <span className="flow-ai"><Sparkles size={13} /> AI reply</span>
                    <span className="flow-tone"><i className="fx-tone" style={d(0.8)} /><span>Formal</span><span>Friendly</span><span>Short</span></span>
                </div>
                <div className="flow-draft">
                    <span className="flow-shimmer fx-shimmer" style={d(1)}><i /><i /></span>
                    <p>{REPLY.map((word, i) => <span key={`${word}-${i}`} className="fx-word" style={{ "--d": `${1.8 + i * 0.06}s` } as CSSProperties}>{word} </span>)}</p>
                </div>
                <div className="flow-composer-foot">
                    <span className="flow-ghost-btn">Edit</span>
                    <span className="flow-publish fx-publish" style={d(4)}>
                        <span className="fx-hide" style={d(4)}>Publish reply</span>
                        <span className="fx-show" style={d(4.1)}><Check size={13} /> Published to Google</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
