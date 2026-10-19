"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareText, Pause, PenLine, Play, Send } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { FlowAskScene, FlowCollectScene, FlowReplyScene } from "@/components/marketing/marketing-home/home-flow-scenes";

const STEPS = [
  {
    icon: Send,
    title: "Ask at the right moment",
    text: "Send a branded request by text or email after a visit, or let customers scan a QR code or tap an NFC stand.",
    href: "/features/review-requests",
    Scene: FlowAskScene,
  },
  {
    icon: PenLine,
    title: "Make reviewing effortless",
    text: "Your review page drafts a short review from what they liked. They edit it, then post it to Google themselves.",
    href: "/features/review-page",
    Scene: FlowCollectScene,
  },
  {
    icon: MessageSquareText,
    title: "Reply in your voice",
    text: "AI drafts every Google reply in your tone. Approve each one, or let eligible reviews get answered automatically.",
    href: "/features/ai-replies",
    Scene: FlowReplyScene,
  },
];

/**
 * Auto-playing walkthrough. The active step's progress bar is a CSS animation; when it ends the
 * next step starts, so pausing (the button, or scrolling away) pauses everything in sync. With
 * reduced motion nothing animates and the steps are plain buttons.
 */
export function HomeFlowPlayer({ head }: { head?: ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { Scene } = STEPS[active];

  return (
    <div
      ref={ref}
      className="flow-player"
      data-playing={inView && !paused ? "true" : "false"}
    >
      <div className="flow-copy">
        {head}
        <ol className="flow-steps">
          {STEPS.map(({ icon: Icon, title, text, href }, index) => (
            <li key={title} className={index === active ? "is-active" : undefined}>
              <button type="button" aria-current={index === active ? "step" : undefined} onClick={() => setActive(index)}>
                <Icon size={18} aria-hidden="true" />
                <span>{title}</span>
              </button>
              <div className="flow-step-body">
                <div>
                  <p>{text}</p>
                  <Link href={href} className="home-text-link" tabIndex={index === active ? 0 : -1}>
                    Learn more<span className="sr-only">: {title}</span> <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <span className="flow-progress" aria-hidden="true">
                {index === active && (
                  <span key={active} className="flow-progress-fill" onAnimationEnd={() => setActive((active + 1) % STEPS.length)} />
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flow-stage">
        <div className="flow-phone" aria-hidden="true">
          <div className="flow-screen">
            <Scene key={active} />
          </div>
        </div>
        <button type="button" className="flow-toggle" onClick={() => setPaused(!paused)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}
