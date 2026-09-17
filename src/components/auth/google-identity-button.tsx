"use client";

import Script from "next/script";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";
import {
    buildGoogleAuthCompletionPath,
    createGoogleIdentityNonce,
} from "@/lib/auth/google-identity";
import "@/components/auth/google-identity-types";

interface GoogleIdentityButtonProps {
    clientId: string;
    intent: "signin" | "signup";
    inviteToken: string | null;
    nextPath: string;
}

export function GoogleIdentityButton({
    clientId,
    intent,
    inviteToken,
    nextPath,
}: GoogleIdentityButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const completionFormRef = useRef<HTMLFormElement>(null);
    const initializedRef = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const initializeGoogleButton = useCallback(async () => {
        const button = buttonRef.current;
        const googleIdentity = window.google?.accounts.id;
        if (!button || !googleIdentity || initializedRef.current || !clientId) return;

        initializedRef.current = true;
        try {
            const { nonce, hashedNonce } = await createGoogleIdentityNonce();
            googleIdentity.initialize({
                client_id: clientId,
                nonce: hashedNonce,
                ux_mode: "popup",
                use_fedcm_for_button: true,
                button_auto_select: false,
                callback: async ({ credential }) => {
                    setIsSubmitting(true);
                    let submittingForm = false;
                    try {
                        const supabase = createClient();
                        const { error } = await supabase.auth.signInWithIdToken({
                            provider: "google",
                            token: credential,
                            nonce,
                        });
                        if (error) throw error;
                        if (!completionFormRef.current) throw new Error("Sign-in completion form is unavailable");
                        submittingForm = true;
                        completionFormRef.current.requestSubmit();
                    } catch (error: unknown) {
                        const description = error instanceof Error ? error.message : "Please try again.";
                        toast.error("Google sign-in failed", { description });
                    } finally {
                        if (!submittingForm) setIsSubmitting(false);
                    }
                },
            });
            setIsReady(true);
        } catch {
            initializedRef.current = false;
            setLoadFailed(true);
            toast.error("Google sign-in could not be initialized. Please try again.");
        }
    }, [clientId]);

    useEffect(() => {
        const button = buttonRef.current;
        if (!isReady || !button) return;
        let lastWidth = 0;
        const observer = new ResizeObserver(() => {
            const width = Math.min(Math.floor(button.clientWidth), 400);
            if (!width || width === lastWidth) return;
            lastWidth = width;
            button.replaceChildren();
            window.google?.accounts.id.renderButton(button, {
                type: "standard", theme: "outline", size: "large",
                text: intent === "signin" ? "signin_with" : "signup_with",
                shape: "rectangular", logo_alignment: "left", width,
            });
        });
        observer.observe(button);
        return () => observer.disconnect();
    }, [isReady, intent]);

    if (!clientId) {
        return (
            <p className="auth-google-unavailable" role="status">
                Google sign-in is unavailable. Continue with email below.
            </p>
        );
    }

    return (
        <div className="auth-google" aria-busy={isSubmitting}>
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onReady={() => {
                    setLoadFailed(false);
                    void initializeGoogleButton();
                }}
                onError={() => {
                    setLoadFailed(true);
                    toast.error("Google sign-in could not be loaded. Please try again.");
                }}
            />
            <div ref={buttonRef} className="auth-google-button" inert={isSubmitting || loadFailed} />
            <form
                ref={completionFormRef}
                action={buildGoogleAuthCompletionPath(inviteToken, nextPath)}
                method="post"
                className="hidden"
            />
            {(!isReady || isSubmitting || loadFailed) && (
                <div className="auth-google-placeholder" role="status">
                    {!loadFailed && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    {loadFailed ? "Google unavailable. Use email below." : isSubmitting ? "Completing sign-in…" : "Loading Google sign-in…"}
                </div>
            )}
        </div>
    );
}
