import * as Sentry from "@sentry/nextjs";
import { initBotId } from "botid/client/core";

import { filterClientSentryEvent } from "@/lib/monitoring/sentry-client-filter";
import {
    getSentryBaseInitOptions,
    getSentryReplaysOnErrorSampleRate,
    getSentryReplaysSessionSampleRate,
} from "@/lib/monitoring/sentry-init-options";

Sentry.init({
    ...getSentryBaseInitOptions(),
    beforeSend: filterClientSentryEvent,
    // Session Replay is attached only after analytics consent (see PrivacyScripts /
    // enableSentryReplay); these rates apply once it is added.
    replaysSessionSampleRate: getSentryReplaysSessionSampleRate(),
    replaysOnErrorSampleRate: getSentryReplaysOnErrorSampleRate(),
});

// Invisible bot check for the website chat's forms that reach a real inbox or calendar.
initBotId({
    protect: [
        { path: "/api/marketing/chat/lead", method: "POST" },
        { path: "/api/marketing/chat/demo-book", method: "POST" },
    ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
