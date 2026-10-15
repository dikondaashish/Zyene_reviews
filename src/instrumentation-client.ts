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
    // Session Replay is attached only after analytics consent (see ConsentScripts /
    // enableSentryReplay); these rates apply once it is added.
    replaysSessionSampleRate: getSentryReplaysSessionSampleRate(),
    replaysOnErrorSampleRate: getSentryReplaysOnErrorSampleRate(),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
