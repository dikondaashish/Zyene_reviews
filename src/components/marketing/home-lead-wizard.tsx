"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { HomeLeadWizardEmailStep } from "@/components/marketing/home-lead-wizard-email-step";
import { HomeLeadWizardProgress } from "@/components/marketing/home-lead-wizard-progress";
import { HomeLeadWizardQuestionStep } from "@/components/marketing/home-lead-wizard-question-step";
import { HomeLeadWizardSuccess } from "@/components/marketing/home-lead-wizard-success";
import { HomeLeadWizardVisual } from "@/components/marketing/home-lead-wizard-visual";
import {
  hasSeenHomeLeadWizard,
  markHomeLeadWizardSeen,
} from "@/components/marketing/home-lead-wizard-persistence";

const REVEAL_DELAY_MS = 12000;

export function HomeLeadWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [industry, setIndustry] = useState("");
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previewWizard =
      new URLSearchParams(window.location.search).get("qa") === "wizard";
    if (!previewWizard && hasSeenHomeLeadWizard()) return;
    const timer = window.setTimeout(
      () => {
        if (!previewWizard) markHomeLeadWizardSeen();
        setOpen(true);
      },
      previewWizard ? 0 : REVEAL_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/marketing/book-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), industry, goal }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDownloadUrl(data.downloadUrl ?? "/zyene-overview.pdf");
      setEmailSent(data.emailSent === true);
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="home-lead-wizard-backdrop"
      data-home-lead-wizard
      data-state={status}
      onClick={(event) =>
        event.target === event.currentTarget && setOpen(false)
      }
    >
      <div
        className="home-lead-wizard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-lead-wizard-title"
        aria-describedby="home-lead-wizard-description"
      >
        <button
          ref={closeRef}
          type="button"
          className="home-lead-wizard-close"
          aria-label="Close guide offer"
          onClick={() => setOpen(false)}
        >
          <X size={19} aria-hidden="true" />
        </button>
        <HomeLeadWizardVisual />
        <div className="home-lead-wizard-content">
          <HomeLeadWizardProgress step={step} />
          {status === "success" ? (
            <HomeLeadWizardSuccess
              downloadUrl={downloadUrl}
              emailSent={emailSent}
              onClose={() => setOpen(false)}
            />
          ) : step === 1 ? (
            <HomeLeadWizardQuestionStep
              industry={industry}
              goal={goal}
              onIndustryChange={setIndustry}
              onGoalChange={setGoal}
              onNext={() => setStep(2)}
            />
          ) : (
            <HomeLeadWizardEmailStep
              email={email}
              isLoading={status === "loading"}
              message={message}
              onEmailChange={setEmail}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
