"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state"

export function SyncButton({
    businessId,
    className,
    variant = "outline"
}: {
    businessId?: string,
    className?: string,
    variant?: "outline" | "secondary" | "destructive" | "default" | "ghost" | "link"
}) {
    const [isPosting, setIsPosting] = useState(false)
    const [showForce, setShowForce] = useState(false)
    const [busySince, setBusySince] = useState<number | null>(null)
    const router = useRouter()
    const { isSyncBusy, isStalled, markManualSyncStarted } = useGoogleSyncRemoteState({ businessId })

    const busy = isPosting || isSyncBusy
    const forceHintAfterMs = 60 * 1000

    useEffect(() => {
        if (isSyncBusy) {
            setBusySince((prev) => prev ?? Date.now())
            if (isStalled) setShowForce(true)
            return
        }
        setBusySince(null)
        setShowForce(false)
    }, [isSyncBusy, isStalled])

    useEffect(() => {
        if (showForce) return
        if (!busySince || showForce || isPosting) return
        const elapsed = Date.now() - busySince
        if (elapsed >= forceHintAfterMs) {
            setShowForce(true)
            return
        }
        const timeoutId = setTimeout(() => setShowForce(true), forceHintAfterMs - elapsed)
        return () => clearTimeout(timeoutId)
    }, [busySince, showForce, isPosting, forceHintAfterMs])

    const handleSync = async (force = false) => {
        setIsPosting(true)
        if (force) setShowForce(false)

        try {
            const res = await fetch("/api/sync/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, force }),
            })
            const data = await res.json()

            if (!res.ok) {
                const msg = (data as { error?: string }).error || "Sync failed"
                const code = (data as { code?: string }).code

                if (res.status === 409 || code === "CONFLICT") {
                    setShowForce(true)
                    toast.error("Sync already in progress", {
                        description: "If it's been stuck for a while, try a Force Sync.",
                        duration: 6000,
                    })
                } else {
                    const details = (data as { details?: string }).details
                    const activationUrl = (data as { activationUrl?: string }).activationUrl
                    const description = [details, activationUrl].filter(Boolean).join("\n\n")
                    toast.error(msg, { description: description || undefined, duration: 12_000 })
                }
                return
            }

            markManualSyncStarted()
            toast.success(force ? "Force sync started!" : "Sync started in background")
            router.refresh()
        } catch (error: unknown) {
            toast.error("Failed to sync reviews", { description: error instanceof Error ? error.message : undefined })
        } finally {
            setIsPosting(false)
        }
    }

    return (
        <div className="flex gap-2">
            {showForce && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleSync(true)}
                    disabled={isPosting}
                    className="animate-in fade-in slide-in-from-right-2"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isPosting ? "animate-spin" : ""}`} />
                    Force Reset & Sync
                </Button>
            )}
            <Button
                variant={showForce ? "secondary" : variant}
                size="sm"
                onClick={() => handleSync(false)}
                disabled={busy}
                className={className || "border border-[color:var(--sync-action)] bg-[color:var(--sync-action)] text-primary-foreground hover:bg-[color:var(--sync-action-hover)] hover:border-[color:var(--sync-action-hover)]"}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} />
                {busy ? "Syncing..." : "Sync Reviews"}
            </Button>
        </div>
    )
}
