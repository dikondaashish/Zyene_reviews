/**
 * Capture terminal Inngest function failures in Sentry with job + tenant tags.
 * Step retries still surface when Inngest marks the run finished with an error.
 */
import * as Sentry from "@sentry/nextjs";
import { InngestMiddleware } from "inngest";

import { isExpectedGoogleSyncSetupError } from "@/services/google/sync-service/expected-setup-errors";
import { isPermanentGoogleAuthError } from "@/services/google/sync-service/permanent-auth-errors";

function readStringField(data: unknown, key: string): string | undefined {
    if (!data || typeof data !== "object") return undefined;
    const value = (data as Record<string, unknown>)[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string") return message;
    }
    return String(error);
}

function toCaptureTarget(error: unknown): unknown {
    if (error instanceof Error) return error;
    if (typeof error === "string") return new Error(error);
    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) {
            return Object.assign(new Error(message), { cause: error });
        }
    }
    return error;
}

function shouldSkipInngestSentryCapture(error: unknown): boolean {
    const message = errorMessage(error);
    return isExpectedGoogleSyncSetupError(message) || isPermanentGoogleAuthError(message);
}

export const inngestSentryMiddleware = new InngestMiddleware({
    name: "Sentry Error Capture",
    init: () => ({
        onFunctionRun: ({ ctx, fn }) => ({
            finished: ({ result }) => {
                if (!result.error) return;
                if (shouldSkipInngestSentryCapture(result.error)) return;

                const eventData = ctx.event?.data;
                const businessId = readStringField(eventData, "businessId");
                const organizationId = readStringField(eventData, "organizationId");
                const platformId = readStringField(eventData, "platformId");

                Sentry.withScope((scope) => {
                    scope.setTag("inngest", "true");
                    scope.setTag("inngest_function", fn.name);
                    if (ctx.runId) scope.setTag("inngest_run_id", ctx.runId);
                    if (ctx.event?.name) scope.setTag("inngest_event", ctx.event.name);
                    if (businessId) scope.setTag("business_id", businessId);
                    if (organizationId) scope.setTag("organization_id", organizationId);
                    if (platformId) scope.setTag("platform_id", platformId);
                    scope.setExtra("inngest_event_data", eventData ?? null);
                    Sentry.captureException(toCaptureTarget(result.error));
                });
            },
        }),
    }),
});
