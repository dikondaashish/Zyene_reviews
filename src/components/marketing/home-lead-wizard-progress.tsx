const STEPS = ["Your business", "Your guide"] as const;

/** Two labelled segments; `step` 3 means both are complete (success view). */
export function HomeLeadWizardProgress({ step }: { step: 1 | 2 | 3 }) {
    return (
        <ol className="home-lead-wizard-progress" aria-label={step > 2 ? "All steps complete" : `Step ${step} of 2`}>
            {STEPS.map((label, index) => {
                const position = index + 1;
                const state = position < step ? "done" : position === step ? "current" : "todo";
                return (
                    <li key={label} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                        <span className="home-lead-wizard-progress-bar" aria-hidden="true" />
                        <span className="home-lead-wizard-progress-label">
                            <span className="sr-only">{state === "done" ? "Completed: " : ""}</span>
                            {position}. {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
