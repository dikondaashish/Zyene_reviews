import * as Sentry from "@sentry/nextjs";

import { filterClientSentryEvent } from "@/lib/monitoring/sentry-client-filter";
import {
    getSentryBaseInitOptions,
    getSentryReplaysOnErrorSampleRate,
    getSentryReplaysSessionSampleRate,
} from "@/lib/monitoring/sentry-init-options";

Sentry.init({
    ...getSentryBaseInitOptions(),
    beforeSend: filterClientSentryEvent,
    // Session Replay is browser-only; mask text/media by default (review PII).
    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
    replaysSessionSampleRate: getSentryReplaysSessionSampleRate(),
    replaysOnErrorSampleRate: getSentryReplaysOnErrorSampleRate(),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
