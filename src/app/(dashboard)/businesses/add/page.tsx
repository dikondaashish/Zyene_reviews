"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/db/supabase/client"
import { Store, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { useRouter } from "next/navigation"
import { getActiveBusinessId } from "@/lib/auth/business-context"

export default function AddBusinessPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = React.useState(true)
    const [atLimit, setAtLimit] = React.useState(false)

    React.useEffect(() => {
        async function checkLimit() {
            const { businesses, organization } = await getActiveBusinessId()
            if (organization) {
                const max = organization.max_businesses || 1
                if (businesses.length >= max) {
                    setAtLimit(true)
                    toast.error("Limit reached", {
                        description: `Your plan allows up to ${max} ${max === 1 ? 'business' : 'businesses'}. Please upgrade to add more.`
                    })
                    router.push("/settings/billing")
                }
            }
            setLoading(false)
        }
        checkLimit()
    }, [router])

    const handleConnectGoogle = async () => {
        try {
            // Get the current user's org ID — we pass it in the redirect URL
            // so the callback knows which org to add the business to,
            // even if a different Google account is used for OAuth.
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to add a business")
                return
            }

            // Fetch org ID
            const { data: memberData } = await supabase
                .from("organization_members")
                .select("organization_id")
                .eq("user_id", user.id)
                .single()

            if (!memberData?.organization_id) {
                toast.error("No organization found")
                return
            }

            const orgId = memberData.organization_id
            const userId = user.id

            // Build the redirect URL with org_id and user_id as query params.
            // These travel through the entire OAuth redirect chain:
            // dashboard → Google → Supabase → our callback
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback?next=/businesses&add_org=${orgId}&add_user=${userId}`
                : `https://auth.${rootDomain}/api/auth/callback?next=/businesses&add_org=${orgId}&add_user=${userId}`;

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'openid email profile https://www.googleapis.com/auth/business.manage',
                    redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })
            if (error) throw error
        } catch (error: unknown) {
            toast.error("Failed to initiate Google connection", {
                description: error instanceof Error ? error.message : undefined
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (atLimit) return null

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Back Link */}
            <div>
                <Link
                    href="/businesses"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Businesses
                </Link>
            </div>

            {/* Connect Card */}
            <div className="max-w-lg mx-auto w-full">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                            <Store className="h-6 w-6 text-[#f97316]" />
                        </div>
                        <CardTitle className="text-2xl">Add a Business</CardTitle>
                        <CardDescription>
                            Connect your Google Business Profile to start managing reviews for a new location.
                            You can use a different Google account than the one you signed up with.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button
                            size="lg"
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={handleConnectGoogle}
                        >
                            Connect Google Business Profile
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            We&apos;ll ask for permission to read your Google Business Profile locations.
                            You can select which location to add after connecting.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
