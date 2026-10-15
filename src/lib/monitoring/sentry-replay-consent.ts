"use client";

import * as Sentry from "@sentry/nextjs";

let replayEnabled = false;

/**
 * Session Replay records the visitor's session (masked), so it is treated as
 * analytics and only attached after consent. Error monitoring itself stays on:
 * it sets no cookies and is needed to keep the service secure and working.
 * Sample rates come from `Sentry.init` in `instrumentation-client.ts`.
 */
export function enableSentryReplay(): void {
    if (replayEnabled) return;
    replayEnabled = true;
    Sentry.addIntegration(Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }));
}
