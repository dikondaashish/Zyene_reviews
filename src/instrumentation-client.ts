import * as Sentry from "@sentry/nextjs";

import { filterClientSentryEvent } from "@/lib/monitoring/sentry-client-filter";
import { getSentryBaseInitOptions } from "@/lib/monitoring/sentry-init-options";

Sentry.init({
    ...getSentryBaseInitOptions(),
    beforeSend: filterClientSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
