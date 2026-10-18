"use client";

import "@/components/marketing/support-chat/support-chat.css";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SupportChatLauncher, SupportChatTeaser } from "@/components/marketing/support-chat/support-chat-launcher";
import { dismissTeaser, isTeaserDismissed } from "@/lib/support-chat/client-storage";
import { getPageChatContext } from "@/lib/support-chat/page-context";

/** The panel (and its chat logic) only downloads once a visitor shows interest. */
const SupportChatPanel = dynamic(() => import("@/components/marketing/support-chat/support-chat-panel"), { ssr: false });

const TEASER_DELAY_MS = 6_000;

export function SupportChatWidget() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [teaser, setTeaser] = useState(false);
    const teaserText = getPageChatContext(usePathname()).teaser;

    useEffect(() => {
        if (isTeaserDismissed()) return;
        const timer = window.setTimeout(() => setTeaser(true), TEASER_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, []);

    const openChat = useCallback(() => {
        dismissTeaser();
        setTeaser(false);
        setMounted(true);
        setOpen(true);
    }, []);

    const close = useCallback(() => setOpen(false), []);

    const hideTeaser = useCallback(() => {
        dismissTeaser();
        setTeaser(false);
    }, []);

    return (
        <div className="support-chat-root" data-open={open || undefined}>
            {mounted ? <SupportChatPanel open={open} onClose={close} /> : null}
            {teaser && !open ? <SupportChatTeaser text={teaserText} onOpen={openChat} onDismiss={hideTeaser} /> : null}
            <SupportChatLauncher open={open} onToggle={open ? close : openChat} />
        </div>
    );
}
