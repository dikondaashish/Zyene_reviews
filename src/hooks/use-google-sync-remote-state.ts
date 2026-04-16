"use client"

import { useCallback, useEffect, useState } from "react"

type UseGoogleSyncRemoteStateOptions = {
    businessId?: string
    /** From RSC / parent (e.g. integrations card) */
    initialSyncStatus?: string | null
    initialLastSyncedAt?: string | null
}

/**
 * Tracks Google manual sync as reflected in `review_platforms` (Inngest sets `running` while the job runs).
 * After POST /api/sync/google returns, keeps "busy" until the worker acquires the lock or the sync finishes.
 */
export function useGoogleSyncRemoteState({
    businessId,
    initialSyncStatus = null,
    initialLastSyncedAt = null,
}: UseGoogleSyncRemoteStateOptions) {
    const [remoteStatus, setRemoteStatus] = useState<string | null>(initialSyncStatus)
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(initialLastSyncedAt)
    const [warmingUp, setWarmingUp] = useState(false)
    const [warmupStart, setWarmupStart] = useState<number | null>(null)

    useEffect(() => {
        setRemoteStatus(initialSyncStatus ?? null)
    }, [initialSyncStatus])

    useEffect(() => {
        setLastSyncedAt(initialLastSyncedAt ?? null)
    }, [initialLastSyncedAt])

    const fetchStatus = useCallback(async () => {
        const url = businessId
            ? `/api/sync/google?businessId=${encodeURIComponent(businessId)}`
            : "/api/sync/google"
        const res = await fetch(url)
        if (!res.ok) return
        const body = (await res.json()) as {
            success?: boolean
            data?: { sync_status?: string; last_synced_at?: string | null }
        }
        const data = body.data
        if (!data) return
        setRemoteStatus(data.sync_status ?? null)
        setLastSyncedAt(data.last_synced_at ?? null)
    }, [businessId])

    useEffect(() => {
        void fetchStatus()
    }, [fetchStatus])

    useEffect(() => {
        const shouldPoll = remoteStatus === "running" || warmingUp
        if (!shouldPoll) return
        const id = setInterval(() => void fetchStatus(), 2500)
        return () => clearInterval(id)
    }, [remoteStatus, warmingUp, fetchStatus])

    useEffect(() => {
        if (!warmingUp) return

        if (remoteStatus === "running") {
            setWarmingUp(false)
            return
        }
        if (remoteStatus?.startsWith("error")) {
            setWarmingUp(false)
            return
        }
        if (
            remoteStatus === "idle" &&
            lastSyncedAt &&
            warmupStart !== null &&
            new Date(lastSyncedAt).getTime() >= warmupStart - 5000
        ) {
            setWarmingUp(false)
        }
    }, [warmingUp, remoteStatus, lastSyncedAt, warmupStart])

    useEffect(() => {
        if (!warmingUp) return
        const id = setTimeout(() => setWarmingUp(false), 120_000)
        return () => clearTimeout(id)
    }, [warmingUp])

    const markManualSyncStarted = useCallback(() => {
        setWarmingUp(true)
        setWarmupStart(Date.now())
        void fetchStatus()
    }, [fetchStatus])

    const isSyncBusy = warmingUp || remoteStatus === "running"

    return {
        remoteStatus,
        lastSyncedAt,
        isSyncBusy,
        markManualSyncStarted,
        fetchStatus,
    }
}
