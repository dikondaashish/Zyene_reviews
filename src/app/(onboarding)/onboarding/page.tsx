"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Store, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
    const supabase = createClient()
    const router = useRouter()

    const handleConnectGoogle = async () => {
        try {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/dashboard`
                : `http://dashboard.${rootDomain}/dashboard`;

            // In production, user must configure Google Provider in Supabase
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/business.manage',
                    redirectTo, // Redirect back to dashboard to trigger GBP check
                },
            })
            if (error) throw error
        } catch (error: any) {
            toast.error("Failed to initiate Google connection", {
                description: error.message
            })
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
        const loginUrl = rootDomain.includes("localhost")
            ? `http://${rootDomain}/login`
            : `http://login.${rootDomain}/login`;

        // Redirect to login with error param
        window.location.href = `${loginUrl}?error=account_not_created`
    }

    return (
        <div className="container max-w-lg">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Store className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Connect Google Business Profile</CardTitle>
                    <CardDescription>
                        To activate your account and start managing reviews, you must connect a valid Google Business Profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleConnectGoogle}>
                        Connect Google Business Profile
                    </Button>
                    <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cancel & Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
