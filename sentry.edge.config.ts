import * as Sentry from "@sentry/nextjs";

import { getSentryBaseInitOptions } from "./src/lib/monitoring/sentry-init-options";
import { filterServerSentryEvent } from "./src/lib/monitoring/sentry-server-filter";

Sentry.init({
    ...getSentryBaseInitOptions(),
    beforeSend: filterServerSentryEvent,
});
