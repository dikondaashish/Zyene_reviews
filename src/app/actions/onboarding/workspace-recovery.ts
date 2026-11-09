"use server";

import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { redis } from "@/lib/db/redis";
import { acquireLock, releaseLock } from "@/lib/db/redis-lock";
import {
    recoverOnboardingWorkspace,
    type RecoverWorkspaceResult,
} from "@/services/auth/recover-onboarding-workspace";

/** Onboarding found no organization or business: create whatever is missing for this user. */
export async function completeOnboardingWorkspaceSetup(): Promise<RecoverWorkspaceResult> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "You are not signed in. Please log in again." };

        // One repair per user across tabs and server instances, so concurrent calls can't
        // each see "no organization" and create two. Redis outages fail open.
        const lockKey = `onboarding-workspace-repair:${user.id}`;
        const locked = await acquireLock(lockKey, 60).catch((err: unknown) => {
            logger.warn({ err }, "[onboarding-recovery] lock unavailable");
            return null;
        });
        if (locked === false) {
            return { success: false, error: "Your account is still being set up. Try again in a few seconds." };
        }

        const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
        const result = await recoverOnboardingWorkspace(createAdminClient(), {
            id: user.id,
            email: user.email,
            fullName,
        }).finally(() => (locked ? releaseLock(lockKey) : undefined));
        if (result.success && result.repaired) {
            await redis.del(`user_businesses:${user.id}`).catch((err: unknown) => logger.warn({ err }, "[onboarding-recovery] cache clear failed"));
            revalidatePath("/onboarding");
        }
        return result;
    } catch (err: unknown) {
        logger.error({ err }, "[onboarding-recovery] completeOnboardingWorkspaceSetup failed");
        return { success: false, error: "We couldn't finish setting up your account. Please try again." };
    }
}
