"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, type LucideIcon } from "lucide-react";

export function AuthHeading({ title, children }: { title: string; children: ReactNode }) {
    return <header className="auth-form-heading"><h1>{title}</h1><p>{children}</p></header>;
}

export function AuthDivider() {
    return <div className="auth-divider">or continue with email</div>;
}

export function AuthError({ message }: { message?: string | null }) {
    return message ? <div className="auth-error" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>{message}</span></div> : null;
}

interface AuthSubmitProps {
    loading: boolean;
    pending: string;
    /** Extra disabled state, e.g. while a reset link is still being verified. */
    disabled?: boolean;
    children: ReactNode;
}

export function AuthSubmit({ loading, children, pending, disabled = false }: AuthSubmitProps) {
    return (
        <button type="submit" className="auth-submit" disabled={loading || disabled}>
            {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : null}
            {loading ? pending : children}
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
        </button>
    );
}

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { icon: LucideIcon };

/** Text input with a leading icon; the icon is decorative, the field keeps its own label. */
export function AuthInput({ icon: Icon, ...inputProps }: AuthInputProps) {
    return (
        <div className="auth-input-wrap">
            <Icon className="auth-input-icon" size={17} aria-hidden="true" />
            <input {...inputProps} className="auth-input" />
        </div>
    );
}

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
    visible: boolean;
    onToggle: () => void;
};

export function AuthPasswordField({ visible, onToggle, ...inputProps }: PasswordFieldProps) {
    return (
        <div className="auth-input-wrap auth-password">
            <Lock className="auth-input-icon" size={17} aria-hidden="true" />
            <input {...inputProps} className="auth-input" type={visible ? "text" : "password"} />
            <button type="button" className="auth-password-toggle" onClick={onToggle}
                aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}
                aria-controls={inputProps.id} disabled={inputProps.disabled}>
                {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
        </div>
    );
}
