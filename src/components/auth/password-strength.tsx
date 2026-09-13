"use client";

import { Check } from "lucide-react";

const SUGGESTIONS = [
    { label: "8+ characters", check: (password: string) => password.length >= 8 },
    { label: "Upper & lowercase", check: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Number or symbol", check: (password: string) => /[0-9]|[^a-zA-Z0-9\s]/.test(password) },
];

export function PasswordStrengthIndicator({ password }: { password: string }) {
    if (!password) return null;
    return (
        <div className="auth-hint">
            <p className="mb-2">For a stronger password:</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {SUGGESTIONS.map(({ label, check }) => (
                    <li key={label} className="inline-flex items-center gap-1">
                        <Check size={13} aria-hidden="true" className={check(password) ? "text-success" : "text-muted-foreground opacity-40"} />
                        <span className="sr-only">{check(password) ? "Met: " : "Suggested: "}</span>{label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
