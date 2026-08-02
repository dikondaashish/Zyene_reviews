"use client";

import Script from "next/script";
import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
            button.replaceChildren();
            googleIdentity.renderButton(button, {
                type: "standard",
                theme: "filled_black",
                size: "large",
                text: intent === "signin" ? "signin_with" : "signup_with",
                shape: "pill",
                logo_alignment: "left",
                width: Math.min(button.clientWidth || 400, 400),
            });
        } catch {
            initializedRef.current = false;
            setLoadFailed(true);
            toast.error("Google sign-in could not be initialized. Please try again.");
        }
    }, [clientId, intent]);

    if (!clientId) {
        return (
            <button
                type="button"
                disabled
                className="flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background opacity-50"
            >
                Google sign-in is unavailable
            </button>
        );
    }

    return (
        <div className="relative flex min-h-10 w-full justify-center" aria-busy={isSubmitting}>
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
            <div ref={buttonRef} className="flex min-h-10 w-full justify-center" />
            <form
                ref={completionFormRef}
                action={buildGoogleAuthCompletionPath(inviteToken, nextPath)}
                method="post"
                className="hidden"
            />
            {(isSubmitting || loadFailed) && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground text-background">
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Google unavailable"}
                </div>
            )}
        </div>
    );
}
