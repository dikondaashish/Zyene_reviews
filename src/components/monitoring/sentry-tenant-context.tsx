"use client";

import { useEffect } from "react";

import {
    setSentryTenantContext,
    type SentryTenantContextInput,
} from "@/lib/monitoring/set-sentry-tenant-context";

/** Keeps browser Sentry scope aligned with the active dashboard tenant. */
export function SentryTenantContext(props: SentryTenantContextInput) {
    const { userId, email, businessId, organizationId } = props;

    useEffect(() => {
        setSentryTenantContext({ userId, email, businessId, organizationId });
    }, [userId, email, businessId, organizationId]);

    return null;
}
