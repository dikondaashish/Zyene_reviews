"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch("/api/sync/google", { method: "POST" })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Sync failed")

            toast.success(`Synced ${data.count || 0} reviews!`)
            router.refresh()
        } catch (error: any) {
            toast.error("Failed to sync reviews", {
                description: error.message
            })
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
        >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Reviews"}
        </Button>
    )
}
