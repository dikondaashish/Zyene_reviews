import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { OnboardingFlow } from "./onboarding-flow"

export default async function OnboardingPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/login")
    }

    const admin = createAdminClient()

    // --- 1. Ensure public.users record exists ---
    const { data: existingUser } = await admin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

    if (!existingUser) {
        const fullName =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User"

        await admin.from("users").insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
        })
    }

    // --- 2. Check if user already has an org membership ---
    const { data: memberships } = await admin
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)

    if (memberships && memberships.length > 0) {
        // User is already in an org, skip onboarding
        return redirect("/dashboard")
    }

    // --- 3. Process invite if present in user metadata ---
    const inviteToken = user.user_metadata?.invite

    if (inviteToken) {
        const { data: invite, error: inviteFetchError } = await admin
            .from("invitations")
            .select("*")
            .eq("token", inviteToken)
            .single()

        if (invite && !inviteFetchError) {
            // Check expiry
            if (new Date(invite.expires_at) > new Date()) {
                // Add to organization
                const { error: memberError } = await admin
                    .from("organization_members")
                    .insert({
                        organization_id: invite.organization_id,
                        user_id: user.id,
                        role: invite.role.startsWith("STORE") ? "ORG_EMPLOYEE" : invite.role,
                        status: "active",
                    })

                if (!memberError) {
                    // If store role, also add to business_members
                    if (invite.business_id && invite.role.startsWith("STORE")) {
                        await admin
                            .from("business_members")
                            .insert({
                                business_id: invite.business_id,
                                user_id: user.id,
                                role: invite.role,
                                status: "active",
                            })
                    }

                    // Delete the invitation
                    await admin.from("invitations").delete().eq("id", invite.id)

                    // Success — go to dashboard
                    return redirect("/dashboard")
                } else {
                    console.error("Failed to add invited user to org:", memberError)
                }
            } else {
                console.error("Invite expired for token:", inviteToken)
            }
        } else {
            console.error("Invite not found for token:", inviteToken, inviteFetchError)
        }
    }

    // --- 4. No invite or invite failed — show normal onboarding (Connect Google) ---
    return <OnboardingFlow />
}
