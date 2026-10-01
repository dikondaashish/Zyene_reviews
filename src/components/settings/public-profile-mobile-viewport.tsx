"use client";

import { useCallback, useEffect, useState, type ReactNode, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";

const PREVIEW_DOCUMENT = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="mobile-preview-root"></div></body></html>';

/** A real viewport makes responsive breakpoints and fixed backgrounds match a phone. */
export function PublicProfileMobileViewport({ children }: { children: ReactNode }) {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
    const initializeFrame = useCallback((event: SyntheticEvent<HTMLIFrameElement>) => {
        const frameDocument = event.currentTarget.contentDocument;
        if (!frameDocument) return;

        frameDocument.head.querySelectorAll("[data-preview-style]").forEach((node) => node.remove());
        document.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
            const copy = node.cloneNode(true) as HTMLElement;
            copy.setAttribute("data-preview-style", "");
            frameDocument.head.appendChild(copy);
        });
        frameDocument.documentElement.className = document.documentElement.className;
        frameDocument.body.className = document.body.className;
        setMountNode(frameDocument.getElementById("mobile-preview-root"));
    }, []);

    useEffect(() => {
        if (!mountNode) return;
        const syncTheme = () => {
            mountNode.ownerDocument.documentElement.className = document.documentElement.className;
            mountNode.ownerDocument.body.className = document.body.className;
        };
        const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [mountNode]);

    return (
        <>
            <iframe
                title="Mobile preview of your public review page"
                srcDoc={PREVIEW_DOCUMENT}
                onLoad={initializeFrame}
                className="block size-full border-0"
            />
            {mountNode && createPortal(children, mountNode)}
        </>
    );
}
