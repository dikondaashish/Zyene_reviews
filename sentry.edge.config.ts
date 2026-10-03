import * as Sentry from "@sentry/nextjs";

import { getSentryBaseInitOptions } from "./src/lib/monitoring/sentry-init-options";

Sentry.init({
    ...getSentryBaseInitOptions(),
});
