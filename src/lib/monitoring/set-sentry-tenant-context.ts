/**
 * Attach authenticated tenant identity to the current Sentry scope.
 * Safe on server and client; no-ops when ids are missing.
 */
import * as Sentry from "@sentry/nextjs";

export type SentryTenantContextInput = {
    userId?: string | null;
    email?: string | null;
    businessId?: string | null;
    organizationId?: string | null;
};

export function setSentryTenantContext(input: SentryTenantContextInput): void {
    const userId = input.userId?.trim() || null;
    const email = input.email?.trim() || undefined;
    const businessId = input.businessId?.trim() || null;
    const organizationId = input.organizationId?.trim() || null;

    if (userId) {
        Sentry.setUser({ id: userId, ...(email ? { email } : {}) });
    } else {
        Sentry.setUser(null);
    }

    if (businessId) {
        Sentry.setTag("business_id", businessId);
    }
    if (organizationId) {
        Sentry.setTag("organization_id", organizationId);
    }
}
