import { BellRing, CheckCircle2, Lock, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { SceneStars, d } from "@/components/auth/auth-scene-parts";

/* Outcome scenes for the auth flow: service recovery and growth. */

export function RecoverScene() {
    return (
        <div className="flow-frame">
            <div className="flow-card flow-private fx-in" style={d(0.05)}>
                <div className="flow-private-head">
                    <span className="flow-lock"><Lock size={12} /> Private feedback</span>
                    <SceneStars count={2} size={12} pop delay={0.4} />
                </div>
                <p>“Waited 40 minutes and the food came out cold.”</p>
                <span className="flow-meta">Tom Reyes · Table 12 · just now</span>
            </div>
            <div className="flow-card flow-alert fx-right" style={d(1.1)}>
                <span className="flow-alert-icon fx-ring" style={d(1.5)}><BellRing size={16} /></span>
                <span className="flow-alert-copy"><strong>Manager alerted</strong><small>Texted to the on-shift manager</small></span>
                <span className="flow-alert-time">now</span>
            </div>
            <div className="flow-resolved fx-pop" style={d(2.5)}><CheckCircle2 size={15} /> Called back and made it right</div>
            <p className="flow-footnote fx-fade" style={d(3.1)}><ShieldCheck size={13} /> Customers can still post a public review anytime.</p>
        </div>
    );
}

const TREND = "M0 52 L28 48 L56 50 L84 40 L112 42 L140 30 L168 26 L196 18 L224 14 L252 8";

export function GrowScene() {
    const stars = [0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />);
    return (
        <div className="flow-frame">
            <div className="flow-card flow-growth fx-in" style={d(0.05)}>
                <div className="flow-growth-head">
                    <span className="flow-label">Google rating</span>
                    <span className="flow-up fx-pop" style={d(2)}><TrendingUp size={12} /> +0.5 in 90 days</span>
                </div>
                <div className="flow-growth-value">
                    <span className="flow-rating-num">4.</span>
                    <span className="flow-rating-stars">
                        <span className="flow-rating-track">{stars}</span>
                        <span className="flow-rating-fill">{stars}</span>
                    </span>
                </div>
                <svg className="flow-chart" viewBox="0 0 252 60" preserveAspectRatio="none" aria-hidden="true">
                    <path className="flow-chart-area" d={`${TREND} L252 60 L0 60 Z`} />
                    <path className="flow-chart-line" d={TREND} />
                </svg>
            </div>
            <div className="flow-stats">
                <div className="flow-card flow-stat fx-in" style={d(1.2)}>
                    <strong className="flow-count" />
                    <span>new reviews this month</span>
                </div>
                <div className="flow-card flow-stat fx-in" style={d(1.4)}>
                    <strong className="flow-percent" />
                    <span>of reviews answered</span>
                </div>
            </div>
        </div>
    );
}
