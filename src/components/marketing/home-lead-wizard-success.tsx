"use client";

import { ArrowRight, Check } from "lucide-react";

type HomeLeadWizardSuccessProps = {
  downloadUrl: string;
  emailSent: boolean;
  onClose: () => void;
};

export function HomeLeadWizardSuccess({
  downloadUrl,
  emailSent,
  onClose,
}: HomeLeadWizardSuccessProps) {
  return (
    <div className="home-lead-wizard-step" key="success">
      <div className="home-lead-wizard-success-icon">
        <Check size={22} aria-hidden="true" />
      </div>
      <p className="home-lead-wizard-kicker">You’re all set</p>
      <h2 id="home-lead-wizard-title">Your guide is ready.</h2>
      <p
        id="home-lead-wizard-description"
        className="home-lead-wizard-description"
      >
        {emailSent ? "We also sent a copy to your inbox. " : ""}Download it now
        and start building a stronger review workflow.
      </p>
      <a
        className="home-lead-wizard-primary"
        href={downloadUrl}
        download="zyene-reviews-guide.pdf"
      >
        Download the guide <ArrowRight size={17} aria-hidden="true" />
      </a>
      <button
        type="button"
        className="home-lead-wizard-text-button"
        onClick={onClose}
      >
        Continue browsing
      </button>
    </div>
  );
}
