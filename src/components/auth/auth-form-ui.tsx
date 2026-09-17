"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

export function AuthHeading({ title, children }: { title: string; children: ReactNode }) {
    return <header className="auth-form-heading"><h1>{title}</h1><p>{children}</p></header>;
}

export function AuthDivider() {
    return <div className="auth-divider">or use your email</div>;
}

export function AuthError({ message }: { message?: string | null }) {
    return message ? <div className="auth-error" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>{message}</span></div> : null;
}

export function AuthSubmit({ loading, children, pending }: { loading: boolean; children: ReactNode; pending: string }) {
    return (
        <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : null}
            {loading ? pending : children}
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
        </button>
    );
}

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
    visible: boolean;
    onToggle: () => void;
};

export function AuthPasswordField({ visible, onToggle, ...inputProps }: PasswordFieldProps) {
    return (
        <div className="auth-password">
            <input {...inputProps} className="auth-input" type={visible ? "text" : "password"} />
            <button type="button" className="auth-password-toggle" onClick={onToggle}
                aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}
                aria-controls={inputProps.id} disabled={inputProps.disabled}>
                {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
        </div>
    );
}
