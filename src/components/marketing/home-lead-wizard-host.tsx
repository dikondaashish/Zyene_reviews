"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHomeLeadWizardTriggers, type TriggerContext } from "@/components/marketing/use-home-lead-wizard-triggers";
import { getBrowserUser } from "@/lib/auth/stale-session";
import { createClient } from "@/lib/db/supabase/client";
import { deserializeUtm, UTM_COOKIE_NAME, parseUtmFromSearchParams, hasUtmParams } from "@/lib/growth/utm";
import { LEAD_WIZARD_OPEN_EVENT } from "@/lib/marketing/lead-wizard-bus";
import { readSessionJourney } from "@/lib/marketing/lead-wizard-journey";
import type { LeadWizardGoal, LeadWizardIndustry } from "@/lib/marketing/lead-wizard-personalization";
import { buildLeadWizardSession, type LeadWizardSession } from "@/lib/marketing/lead-wizard-session";
import { markShownThisSession, readLeadWizardMemory, rememberAutoView, rememberDismissed } from "@/lib/marketing/lead-wizard-storage";
import { claimPopupSlot, releasePopupSlot } from "@/lib/marketing/marketing-popup-slot";
import { trackLeadWizard } from "@/lib/marketing/track-lead-wizard-client";

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

export type LeadWizardCloseDetails = { step: string; industry?: LeadWizardIndustry; goal?: LeadWizardGoal };

/** Mounted once in the marketing layout: owns the smart triggers and the single wizard instance. */
export function HomeLeadWizardHost() {
    const pathname = usePathname() ?? "/";
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState<LeadWizardSession | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const convertedRef = useRef(false);
    const signedInRef = useRef(false);

    useEffect(() => {
        void getBrowserUser(createClient())
            .then((user) => {
                signedInRef.current = Boolean(user);
            })
            .catch(() => undefined);
    }, []);

    const show = useCallback(
        ({ trigger, score, journeyPages }: TriggerContext) => {
            const manual = trigger === "manual" || trigger === "qa";
            if (!claimPopupSlot("lead_wizard", { force: manual })) return;
            returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            convertedRef.current = false;
            const next = buildLeadWizardSession({ trigger, score, journeyPages, pagePath: pathname, utm: readUtm(), memory: readLeadWizardMemory() });
            markShownThisSession();
            if (!manual) rememberAutoView();
            setSession(next);
            setOpen(true);
            trackLeadWizard("lead_wizard_view", next, {
                preselected_industry: next.suggested.industry ?? next.industry ?? "",
                preselected_goal: next.suggested.goal ?? next.goal ?? "",
                pages_this_session: String(journeyPages.length),
            });
        },
        [pathname],
    );

    useHomeLeadWizardTriggers(pathname, signedInRef, show);

    useEffect(() => {
        const onOpen = () => show({ trigger: "manual", score: 0, journeyPages: readSessionJourney().pages });
        window.addEventListener(LEAD_WIZARD_OPEN_EVENT, onOpen);
        return () => window.removeEventListener(LEAD_WIZARD_OPEN_EVENT, onOpen);
    }, [show]);

    const close = useCallback(
        (details: LeadWizardCloseDetails) => {
            setOpen(false);
            releasePopupSlot("lead_wizard");
            if (convertedRef.current || !session) return;
            rememberDismissed(details);
            trackLeadWizard("lead_wizard_close", session, { step: details.step });
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
