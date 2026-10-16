import type { CSSProperties } from "react";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";

type Flow = FeatureLandingContent["flow"];

/** "How it works" diagram: numbered nodes on a connected track, with an optional fork at the end. */
export function FeatureLandingFlow({ flow }: { flow: Flow }) {
  const count = flow.steps.length;
  return (
    <section className="marketing-section fl-flow" aria-labelledby="fl-flow-heading">
      <div className="marketing-container">
        <div className="fl-section-head">
          <p className="marketing-eyebrow">{flow.eyebrow}</p>
          <h2 id="fl-flow-heading">{flow.title}</h2>
          <p>{flow.intro}</p>
        </div>
        <div className="fl-flow-track" style={{ "--fl-steps": count } as CSSProperties}>
          <span className="fl-flow-line" aria-hidden="true">
            <span className="fl-flow-pulse" />
          </span>
          <ol className="fl-flow-nodes">
          {flow.steps.map(({ icon: Icon, title, text, sample }, index) => (
            <li key={title} className="fl-flow-node">
              <span className="fl-flow-badge" aria-hidden="true">
                <Icon size={22} />
                <small>{String(index + 1).padStart(2, "0")}</small>
              </span>
              <div className="fl-flow-card">
                <h3>
                  <span className="sr-only">Step {index + 1}: </span>
                  {title}
                </h3>
                <p>{text}</p>
                {sample && <span className="fl-flow-sample">{sample}</span>}
              </div>
            </li>
          ))}
          </ol>
        </div>
        {flow.branch && (
          <div className="fl-flow-branch">
            <svg className="fl-flow-fork" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M200 0 V20 Q200 30 190 30 H110 Q100 30 100 40 V60" />
              <path d="M200 0 V20 Q200 30 210 30 H290 Q300 30 300 40 V60" />
            </svg>
            <p className="fl-flow-branch-label">{flow.branch.label}</p>
            <div className="fl-flow-paths">
              {flow.branch.paths.map(({ icon: Icon, title, text, tone }) => (
                <div key={title} className={`fl-flow-path fl-flow-path-${tone}`}>
                  <Icon size={20} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
