"use client";

import { Check } from "lucide-react";

const SUGGESTIONS = [
    { label: "8+ characters", check: (password: string) => password.length >= 8 },
    { label: "Upper & lowercase", check: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Number or symbol", check: (password: string) => /[0-9]|[^a-zA-Z0-9\s]/.test(password) },
];

/** Minimum-length hint until the user types, then a live checklist of suggestions. */
export function PasswordStrengthIndicator({ id, password }: { id: string; password: string }) {
    if (!password) return <p id={id} className="auth-hint">Use 6 or more characters. Longer and unique is safer.</p>;
    return (
        <ul id={id} className="auth-hint flex flex-wrap gap-x-4 gap-y-1" aria-label="Password suggestions">
            {SUGGESTIONS.map(({ label, check }) => (
                <li key={label} className={`inline-flex items-center gap-1.5 ${check(password) ? "text-foreground" : ""}`}>
                    <Check size={13} aria-hidden="true" className={check(password) ? "text-success" : "opacity-35"} />
                    <span className="sr-only">{check(password) ? "Met: " : "Suggested: "}</span>{label}
                </li>
            ))}
        </ul>
    );
}
