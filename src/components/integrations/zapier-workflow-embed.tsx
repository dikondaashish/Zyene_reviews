"use client";

import Script from "next/script";
import { useTheme } from "next-themes";

const ZAPIER_ELEMENTS_BASE = "https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements";

type ZapierWorkflowAttributes = {
    "client-id": string;
    theme?: "light" | "dark" | "auto";
    "intro-copy-display"?: "show" | "hide";
    "app-search-bar-display"?: "show" | "hide";
    "guess-zap-display"?: "show" | "hide";
    "manage-zaps-display"?: "show" | "hide";
    "template-cta-display"?: "show" | "hide";
    "template-limit"?: number;
    "sign-up-email"?: string;
    "sign-up-first-name"?: string;
    "sign-up-last-name"?: string;
};

declare module "react" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            "zapier-workflow": ZapierWorkflowAttributes;
        }
    }
}

export interface ZapierSignUpPrefill {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
}

/**
 * Zapier's Workflow Element (web component). Our app is pre-selected via the
 * client ID; Zapier renders sign-in, the AI Zap guesser, the app picker, and
 * our public Zap templates. The sign-up prefill enables Quick Account Creation.
 */
export function ZapierWorkflowEmbed({
    clientId,
    signUp,
}: {
    clientId: string;
    signUp: ZapierSignUpPrefill;
}) {
    const { resolvedTheme } = useTheme();
    const hasFullSignUp = Boolean(signUp.email && signUp.firstName && signUp.lastName);

    return (
        <>
            <link rel="stylesheet" href={`${ZAPIER_ELEMENTS_BASE}/zapier-elements.css`} precedence="default" />
            <Script type="module" src={`${ZAPIER_ELEMENTS_BASE}/zapier-elements.esm.js`} strategy="afterInteractive" />
            <zapier-workflow
                client-id={clientId}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                intro-copy-display="show"
                app-search-bar-display="show"
                guess-zap-display="show"
                manage-zaps-display="show"
                template-cta-display="show"
                template-limit={5}
                {...(hasFullSignUp
                    ? {
                          "sign-up-email": signUp.email ?? undefined,
                          "sign-up-first-name": signUp.firstName ?? undefined,
                          "sign-up-last-name": signUp.lastName ?? undefined,
                      }
                    : {})}
            />
        </>
    );
}
