import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";

type Flow = FeatureLandingContent["flow"];

/** "How it works": heading on the left, hairline step list on the right, with an optional fork at the end. */
export function FeatureLandingFlow({ flow }: { flow: Flow }) {
  return (
    <section className="marketing-section fl-flow" aria-labelledby="fl-flow-heading">
      <div className="marketing-container fl-flow-grid">
        <div className="fl-flow-head">
          <h2 id="fl-flow-heading">{flow.title}</h2>
          <p>{flow.intro}</p>
        </div>
        <div>
          <ol className="fl-flow-steps">
            {flow.steps.map(({ icon: Icon, title, text, sample }, index) => (
              <li key={title}>
                <Icon size={18} aria-hidden="true" />
                <div>
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
          {flow.branch && (
            <div className="fl-flow-branch">
              <p className="fl-flow-branch-label">{flow.branch.label}</p>
              <div className="fl-flow-paths">
                {flow.branch.paths.map(({ icon: Icon, title, text, tone }) => (
                  <div key={title} className={`fl-flow-path fl-flow-path-${tone}`}>
                    <Icon size={18} aria-hidden="true" />
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
