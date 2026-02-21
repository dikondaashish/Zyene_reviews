"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Store, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function AddBusinessPage() {
    const supabase = createClient()

    const handleConnectGoogle = async () => {
        try {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback?next=/businesses`
                : `http://auth.${rootDomain}/api/auth/callback?next=/businesses`;

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
        } catch (error: any) {
            toast.error("Failed to initiate Google connection", {
                description: error.message
            })
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Back Link */}
            <div>
                <Link
                    href="/businesses"
                    className="text-sm text-muted-foreground hover:text-slate-900 flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Businesses
                </Link>
            </div>

            {/* Connect Card */}
            <div className="max-w-lg mx-auto w-full">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Store className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Add a Business</CardTitle>
                        <CardDescription>
                            Connect your Google Business Profile to start managing reviews for a new location.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-700"
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
