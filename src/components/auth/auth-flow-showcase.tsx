"use client";

import { type ComponentType, type CSSProperties, useState } from "react";
import { InboxScene, ReplyScene, RequestScene } from "@/components/auth/auth-flow-scenes";
import { GrowScene, RecoverScene } from "@/components/auth/auth-flow-scenes-outcomes";
import "@/components/auth/auth-flow.css";

interface FlowStep {
    label: string;
    title: string;
    text: string;
    /** How long the step stays on screen before the flow moves on. */
    ms: number;
    Scene: ComponentType;
}

const STEPS: FlowStep[] = [
    { label: "Request", title: "Ask every happy customer", text: "Branded review requests by SMS, email, link or QR code.", ms: 5200, Scene: RequestScene },
    { label: "Collect", title: "One inbox for every review", text: "Google, Facebook and Yelp reviews land in one place.", ms: 4600, Scene: InboxScene },
    { label: "Reply", title: "Replies in your voice", text: "AI drafts each reply in your tone. Approve it or auto-publish.", ms: 6000, Scene: ReplyScene },
    { label: "Recover", title: "Catch problems privately", text: "Negative Feedback Shield alerts your team so you can make it right.", ms: 5200, Scene: RecoverScene },
    { label: "Grow", title: "Watch your rating climb", text: "Track rating, review volume and response rate over time.", ms: 5600, Scene: GrowScene },
];

/**
 * Auto-playing tour of the review loop. The active step's progress bar is a
 * CSS animation; when it ends the flow advances, so hovering the panel (which
 * pauses the bar) pauses the tour, and reduced motion (no animation) leaves
 * the visitor in control of the step buttons.
 */
export function AuthFlowShowcase() {
    const [active, setActive] = useState(0);
    const next = () => setActive((step) => (step + 1) % STEPS.length);
    return (
        <>
            <div className="flow-stage" aria-hidden="true">
                {STEPS.map(({ label, Scene }, i) => (
                    <div key={label} className="flow-scene" data-active={i === active}>
                        <Scene />
                    </div>
                ))}
            </div>
            <div className="flow-caption">
                {STEPS.map(({ label, title, text }, i) => (
                    <div key={label} className="flow-caption-item" data-active={i === active} aria-hidden={i !== active}>
                        <p className="flow-caption-title">{title}</p>
                        <p>{text}</p>
                    </div>
                ))}
            </div>
            <ol className="flow-steps" aria-label="How Zyene Reviews works">
                {STEPS.map(({ label, ms }, i) => (
                    <li key={label}>
                        <button type="button" className="flow-step" onClick={() => setActive(i)}
                            aria-current={i === active ? "step" : undefined} data-done={i < active || undefined}>
                            <span className="flow-step-bar">
                                <i style={{ "--flow-ms": `${ms}ms` } as CSSProperties}
                                    onAnimationEnd={(event) => { if (event.animationName === "flow-progress") next(); }} />
                            </span>
                            <span className="flow-step-label"><span className="flow-step-num">0{i + 1}</span>{label}</span>
                        </button>
                    </li>
                ))}
            </ol>
        </>
    );
}
