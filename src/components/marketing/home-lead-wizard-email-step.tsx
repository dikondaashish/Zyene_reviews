"use client";

import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

import type { FormEvent } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

type HomeLeadWizardEmailStepProps = {
  email: string;
  isLoading: boolean;
  message: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export function HomeLeadWizardEmailStep({
  email,
  isLoading,
  message,
  onEmailChange,
  onSubmit,
  onBack,
}: HomeLeadWizardEmailStepProps) {
  return (
    <form className="home-lead-wizard-step" key="step-two" onSubmit={onSubmit}>
      <p className="home-lead-wizard-kicker">
        <Sparkles size={15} aria-hidden="true" /> One useful download, straight
        to you
      </p>
      <DialogTitle asChild>
        <h2>Where should we send your guide?</h2>
      </DialogTitle>
      <DialogDescription asChild>
        <p className="home-lead-wizard-description">
          Enter your email to unlock the Zyene Reviews reputation management
          guide.
        </p>
      </DialogDescription>
      <label htmlFor="home-lead-wizard-email">Email address</label>
      <input
        id="home-lead-wizard-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@yourbusiness.com"
        disabled={isLoading}
      />
      {message ? (
        <p className="home-lead-wizard-error" role="alert">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        className="home-lead-wizard-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2
              size={17}
              className="home-lead-wizard-spin"
              aria-hidden="true"
            />{" "}
            Saving your guide...
          </>
        ) : (
          <>
            Get the free guide <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
      <button
        type="button"
        className="home-lead-wizard-text-button"
        onClick={onBack}
      >
        Back to questions
      </button>
      <p className="home-lead-wizard-privacy">
        We’ll only send the guide and occasional practical review tips.
      </p>
    </form>
  );
}
