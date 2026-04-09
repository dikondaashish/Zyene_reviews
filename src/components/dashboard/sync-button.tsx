"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SyncButton({ businessId }: { businessId?: string }) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [showForce, setShowForce] = useState(false)
    const router = useRouter()

    const handleSync = async (force = false) => {
        setIsSyncing(true)
        if (force) setShowForce(false)

        try {
            const res = await fetch("/api/sync/google", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, force })
            })
            const data = await res.json()
            
            if (!res.ok) {
                const msg = (data as { error?: string }).error || "Sync failed"
                const code = (data as any).code
                
                // If conflict, show "Force" option
                if (res.status === 409 || code === "CONFLICT") {
                    setShowForce(true)
                    toast.error("Sync already in progress", { 
                        description: "If it's been stuck for a while, try a Force Sync.",
                        duration: 6000 
                    })
                } else {
                    const details = (data as { details?: string }).details
                    const activationUrl = (data as { activationUrl?: string }).activationUrl
                    const description = [details, activationUrl].filter(Boolean).join("\n\n")
                    toast.error(msg, { description: description || undefined, duration: 12_000 })
                }
                return
            }

            toast.success(force ? "Force sync started!" : "Sync started in background")
            router.refresh()
        } catch (error: unknown) {
            toast.error("Failed to sync reviews", { description: error instanceof Error ? error.message : undefined })
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="flex gap-2">
            {showForce && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleSync(true)}
                    disabled={isSyncing}
                    className="animate-in fade-in slide-in-from-right-2"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                    Force Reset & Sync
                </Button>
            )}
            <Button
                variant={showForce ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleSync(false)}
                disabled={isSyncing}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Reviews"}
            </Button>
        </div>
    )
}
