"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Lock } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { GuidePreview } from "@/lib/marketing/lead-wizard-personalization";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = {
    email: string;
    preview: GuidePreview;
    resumed: boolean;
    isLoading: boolean;
    serverError: string;
    onEmailChange: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
};

export function HomeLeadWizardEmailStep({ email, preview, resumed, isLoading, serverError, onEmailChange, onSubmit, onBack }: Props) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [touched, setTouched] = useState(false);
    const valid = EMAIL_RE.test(email.trim());
    const fieldError = touched && !valid ? (email.trim() ? "That email doesn't look right. Try you@business.com." : "Enter your email to get the guide.") : "";
    const error = fieldError || serverError;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <form
            className="home-lead-wizard-step"
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                setTouched(true);
                if (valid) onSubmit();
                else inputRef.current?.focus();
            }}
        >
            <p className="home-lead-wizard-kicker">{resumed ? "Welcome back · we saved your answers" : "Your guide is ready"}</p>
            <DialogPrimitive.Title className="home-lead-wizard-title">Where should we send your {preview.title}?</DialogPrimitive.Title>
            <DialogPrimitive.Description className="home-lead-wizard-description">
                You&apos;ll get the PDF instantly on the next screen, plus a copy in your inbox.
            </DialogPrimitive.Description>
            <label className="home-lead-wizard-label" htmlFor={`${id}-email`}>
                Work email
            </label>
            <input
                ref={inputRef}
                id={`${id}-email`}
                className="home-lead-wizard-input"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                onBlur={() => setTouched(email.trim().length > 0)}
                placeholder="you@yourbusiness.com"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : `${id}-privacy`}
                disabled={isLoading}
            />
            {error ? (
                <p id={`${id}-error`} className="home-lead-wizard-error" role="alert">
                    {error}
                </p>
            ) : null}
            <button type="submit" className="home-lead-wizard-primary" aria-disabled={isLoading} data-track="guide" data-track-location="lead-wizard">
                {isLoading ? (
                    <>
                        <Loader2 size={17} className="home-lead-wizard-spin" aria-hidden="true" /> Preparing your guide…
                    </>
                ) : (
                    <>
                        Get my free guide <ArrowRight size={17} aria-hidden="true" />
                    </>
                )}
            </button>
            <p id={`${id}-privacy`} className="home-lead-wizard-privacy">
                <Lock size={13} aria-hidden="true" /> One email with your guide and occasional review tips. Unsubscribe anytime.{" "}
                <Link href="/privacy">Privacy</Link>
            </p>
            <button type="button" className="home-lead-wizard-text-button" onClick={onBack} disabled={isLoading}>
                <ArrowLeft size={15} aria-hidden="true" /> Change answers
            </button>
        </form>
    );
}
