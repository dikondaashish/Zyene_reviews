"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHomeLeadWizardTriggers } from "@/components/marketing/use-home-lead-wizard-triggers";
import { deserializeUtm, UTM_COOKIE_NAME, parseUtmFromSearchParams, hasUtmParams } from "@/lib/growth/utm";
import { LEAD_WIZARD_OPEN_EVENT } from "@/lib/marketing/lead-wizard-bus";
import { preselectAnswers } from "@/lib/marketing/lead-wizard-personalization";
import { markShownThisSession, rememberDismissed } from "@/lib/marketing/lead-wizard-storage";
import type { LeadWizardTrigger } from "@/lib/marketing/lead-wizard-targeting";
import { claimPopupSlot, releasePopupSlot } from "@/lib/marketing/marketing-popup-slot";
import { trackLeadWizard, type LeadWizardSession } from "@/lib/marketing/track-lead-wizard-client";

const GuideDialog = dynamic(
    () => import("@/components/marketing/home-lead-wizard-dialog").then((module) => module.HomeLeadWizardDialog),
    { ssr: false },
);

function readUtm() {
    const fromUrl = parseUtmFromSearchParams(new URLSearchParams(window.location.search));
    if (hasUtmParams(fromUrl)) return fromUrl;
    const row = document.cookie.split("; ").find((entry) => entry.startsWith(`${UTM_COOKIE_NAME}=`));
    return row ? deserializeUtm(decodeURIComponent(row.split("=").slice(1).join("="))) : null;
}

/** Mounted once in the marketing layout: owns the smart triggers and the single wizard instance. */
export function HomeLeadWizardHost() {
    const pathname = usePathname() ?? "/";
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState<LeadWizardSession | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const convertedRef = useRef(false);

    const show = useCallback(
        (trigger: LeadWizardTrigger) => {
            const manual = trigger === "manual" || trigger === "qa";
            if (!claimPopupSlot("lead_wizard", { force: manual })) return;
            returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            convertedRef.current = false;
            const next: LeadWizardSession = { trigger, pagePath: pathname, ...preselectAnswers({ pathname, utm: readUtm() }) };
            markShownThisSession();
            setSession(next);
            setOpen(true);
            trackLeadWizard("lead_wizard_view", next, {
                preselected_industry: next.industry ?? "",
                preselected_goal: next.goal ?? "",
            });
        },
        [pathname],
    );

    useHomeLeadWizardTriggers(pathname, show);

    useEffect(() => {
        const onOpen = () => show("manual");
        window.addEventListener(LEAD_WIZARD_OPEN_EVENT, onOpen);
        return () => window.removeEventListener(LEAD_WIZARD_OPEN_EVENT, onOpen);
    }, [show]);

    const close = useCallback(
        (step: string) => {
            setOpen(false);
            releasePopupSlot("lead_wizard");
            if (convertedRef.current || !session) return;
            rememberDismissed();
            trackLeadWizard("lead_wizard_close", session, { step });
        },
        [session],
    );

    if (!session) return null;
    return (
        <GuideDialog
            key={`${session.pagePath}-${session.trigger}`}
            open={open}
            session={session}
            onClose={close}
            onConverted={() => {
                convertedRef.current = true;
            }}
            onCloseFocus={() => returnFocusRef.current?.focus()}
        />
    );
}
