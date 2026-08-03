import * as Sentry from "@sentry/nextjs";

import { filterClientSentryEvent } from "@/lib/monitoring/sentry-client-filter";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
    debug: false,
    beforeSend: filterClientSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
