type HomeLeadWizardProgressProps = {
  step: 1 | 2;
};

export function HomeLeadWizardProgress({ step }: HomeLeadWizardProgressProps) {
  return (
    <>
      <div className="home-lead-wizard-progress-row">
        <span>Personalize your guide</span>
        <span>Step {step} of 2</span>
      </div>
      <div
        className="home-lead-wizard-progress"
        aria-label={`Step ${step} of 2`}
      >
        <span style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>
    </>
  );
}
