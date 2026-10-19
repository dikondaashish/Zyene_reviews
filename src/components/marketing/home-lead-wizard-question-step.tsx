"use client";

import { useId } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
    LEAD_WIZARD_GOALS,
    LEAD_WIZARD_INDUSTRIES,
    type LeadWizardGoal,
    type LeadWizardIndustry,
} from "@/lib/marketing/lead-wizard-personalization";
import type { LeadWizardTrigger } from "@/lib/marketing/lead-wizard-targeting";

type OptionGroupProps<T extends string> = {
    legend: string;
    name: string;
    options: readonly { id: T; label: string }[];
    value?: T;
    suggested?: T;
    onChange: (value: T) => void;
};

/** Native radios styled as cards: arrow keys, Space, and screen readers work out of the box. */
function OptionGroup<T extends string>({ legend, name, options, value, suggested, onChange }: OptionGroupProps<T>) {
    return (
        <fieldset className="home-lead-wizard-group">
            <legend>{legend}</legend>
            <div className="home-lead-wizard-options">
                {options.map((option) => (
                    <label key={option.id} className="home-lead-wizard-option">
                        <input
                            type="radio"
                            name={name}
                            value={option.id}
                            checked={value === option.id}
                            onChange={() => onChange(option.id)}
                        />
                        <span className="home-lead-wizard-option-text">
                            {option.label}
                            {suggested === option.id ? <span className="home-lead-wizard-option-hint">Suggested</span> : null}
                        </span>
                        <span className="home-lead-wizard-option-mark" aria-hidden="true">
                            <Check size={13} strokeWidth={3} />
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

type Props = {
    trigger: LeadWizardTrigger;
    industry?: LeadWizardIndustry;
    goal?: LeadWizardGoal;
    suggested: { industry?: LeadWizardIndustry; goal?: LeadWizardGoal };
    onIndustryChange: (value: LeadWizardIndustry) => void;
    onGoalChange: (value: LeadWizardGoal) => void;
    onNext: () => void;
};

export function HomeLeadWizardQuestionStep({ trigger, industry, goal, suggested, onIndustryChange, onGoalChange, onNext }: Props) {
    const id = useId();
    const ready = Boolean(industry && goal);
    const leaving = trigger === "exit_intent";
    return (
        <form
            className="home-lead-wizard-step"
            onSubmit={(event) => {
                event.preventDefault();
                if (ready) onNext();
            }}
        >
            <p className="home-lead-wizard-kicker">{leaving ? "Before you go" : "Free guide · 2 quick questions"}</p>
            <DialogPrimitive.Title className="home-lead-wizard-title">
                {leaving ? "Take a review playbook with you." : "Get a review playbook built for your business."}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="home-lead-wizard-description">
                Pick two answers and watch your guide adapt. Free, no signup.
            </DialogPrimitive.Description>
            <OptionGroup
                legend="What kind of business do you run?"
                name={`${id}-industry`}
                options={LEAD_WIZARD_INDUSTRIES}
                value={industry}
                suggested={suggested.industry}
                onChange={onIndustryChange}
            />
            <OptionGroup
                legend="What would help most right now?"
                name={`${id}-goal`}
                options={LEAD_WIZARD_GOALS}
                value={goal}
                suggested={suggested.goal}
                onChange={onGoalChange}
            />
            <button type="submit" className="home-lead-wizard-primary" aria-disabled={!ready} aria-describedby={`${id}-hint`}>
                Continue <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p id={`${id}-hint`} className="home-lead-wizard-hint" aria-live="polite">
                {ready ? "Next: tell us where to send it." : "Choose one answer in each group to continue."}
            </p>
        </form>
    );
}
