"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function GoogleConnectButton({ isConnected }: { isConnected: boolean }) {
    const supabase = createClient()

    const handleConnectGoogle = async () => {
        try {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback?next=/dashboard`
                : `http://auth.${rootDomain}/api/auth/callback?next=/dashboard`;

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'openid email profile https://www.googleapis.com/auth/business.manage',
                    redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            })
            if (error) throw error
        } catch (error: any) {
            toast.error("Failed to initiate Google connection", {
                description: error.message
            })
        }
    }

    if (isConnected) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" disabled className="text-green-600 border-green-200 bg-green-50 pointer-events-none">
                    ✓ Google Connected
                </Button>
                <Button variant="ghost" size="sm" onClick={handleConnectGoogle} className="text-muted-foreground hover:text-foreground">
                    Reconnect
                </Button>
            </div>
        )
    }

    return (
        <Button onClick={handleConnectGoogle} className="bg-blue-600 hover:bg-blue-700 text-white">
            Connect Google &rarr;
        </Button>
    )
}
