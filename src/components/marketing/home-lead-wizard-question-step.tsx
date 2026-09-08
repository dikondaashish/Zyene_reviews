"use client";

import { ArrowRight, BookOpen, Check } from "lucide-react";

const INDUSTRIES = [
  "Restaurant or cafe",
  "Healthcare",
  "Home services",
  "Other local business",
];
const GOALS = [
  "Get more reviews",
  "Reply faster",
  "Protect my rating",
  "Build one workflow",
];

type OptionGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="home-lead-wizard-options">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              className={selected ? "is-selected" : ""}
              onClick={() => onChange(option)}
            >
              <span>{option}</span>
              <span className="home-lead-wizard-option-mark" aria-hidden="true">
                {selected ? <Check size={14} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

type HomeLeadWizardQuestionStepProps = {
  industry: string;
  goal: string;
  onIndustryChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onNext: () => void;
};

export function HomeLeadWizardQuestionStep({
  industry,
  goal,
  onIndustryChange,
  onGoalChange,
  onNext,
}: HomeLeadWizardQuestionStepProps) {
  return (
    <div className="home-lead-wizard-step" key="step-one">
      <p className="home-lead-wizard-kicker">
        <BookOpen size={15} aria-hidden="true" /> Free guide for local
        businesses
      </p>
      <h2 id="home-lead-wizard-title">
        Turn customer feedback into regional growth.
      </h2>
      <p
        id="home-lead-wizard-description"
        className="home-lead-wizard-description"
      >
        Answer two quick questions and we’ll point you to the most useful
        starting points.
      </p>
      <OptionGroup
        label="What kind of business do you run?"
        options={INDUSTRIES}
        value={industry}
        onChange={onIndustryChange}
      />
      <OptionGroup
        label="What would help most right now?"
        options={GOALS}
        value={goal}
        onChange={onGoalChange}
      />
      <button
        type="button"
        className="home-lead-wizard-primary"
        disabled={!industry || !goal}
        onClick={onNext}
      >
        Next step <ArrowRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
