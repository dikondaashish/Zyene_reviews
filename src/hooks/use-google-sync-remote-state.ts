"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type UseGoogleSyncRemoteStateOptions = {
    businessId?: string
    /** From RSC / parent (e.g. integrations card) */
    initialSyncStatus?: string | null
    initialLastSyncedAt?: string | null
    initialTotalReviews?: number | null
    initialAverageRating?: number | null
    /** Fired once when DB-backed status goes from `running` to `idle` (sync finished). Use for `router.refresh()`. */
    onSyncSettled?: () => void
}

/**
 * Tracks Google manual sync as reflected in `review_platforms` (Inngest sets `running` while the job runs).
 * After POST /api/sync/google returns, keeps "busy" until the worker acquires the lock or the sync finishes.
 */
export function useGoogleSyncRemoteState({
    businessId,
    initialSyncStatus = null,
    initialLastSyncedAt = null,
    initialTotalReviews = null,
    initialAverageRating = null,
    onSyncSettled,
}: UseGoogleSyncRemoteStateOptions) {
    const [remoteStatus, setRemoteStatus] = useState<string | null>(initialSyncStatus)
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(initialLastSyncedAt)
    const [totalReviews, setTotalReviews] = useState<number | null>(initialTotalReviews)
    const [averageRating, setAverageRating] = useState<number | null>(initialAverageRating)
    const [warmingUp, setWarmingUp] = useState(false)
    const [warmupStart, setWarmupStart] = useState<number | null>(null)
    const [lockedUntil, setLockedUntil] = useState<string | null>(null)
    const prevRemoteStatusRef = useRef<string | null>(null)
    const onSyncSettledRef = useRef(onSyncSettled)
    onSyncSettledRef.current = onSyncSettled

    useEffect(() => {
        setRemoteStatus(initialSyncStatus ?? null)
    }, [initialSyncStatus])

    useEffect(() => {
        setLastSyncedAt(initialLastSyncedAt ?? null)
    }, [initialLastSyncedAt])

    useEffect(() => {
        setTotalReviews(initialTotalReviews ?? null)
    }, [initialTotalReviews])

    useEffect(() => {
        setAverageRating(initialAverageRating ?? null)
    }, [initialAverageRating])

    const fetchStatus = useCallback(async () => {
        const url = businessId
            ? `/api/sync/google?businessId=${encodeURIComponent(businessId)}`
            : "/api/sync/google"
        const res = await fetch(url)
        if (!res.ok) return
        const body = (await res.json()) as {
            success?: boolean
            data?: {
                sync_status?: string
                last_synced_at?: string | null
                locked_until?: string | null
                total_reviews?: number
                average_rating?: number | null
            }
        }
        const data = body.data
        if (!data) return
        setRemoteStatus(data.sync_status ?? null)
        setLastSyncedAt(data.last_synced_at ?? null)
        setLockedUntil(data.locked_until ?? null)
        if (typeof data.total_reviews === "number") setTotalReviews(data.total_reviews)
        if (data.average_rating != null && !Number.isNaN(Number(data.average_rating))) {
            setAverageRating(Number(data.average_rating))
        }
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

    useEffect(() => {
        const prev = prevRemoteStatusRef.current
        prevRemoteStatusRef.current = remoteStatus ?? null
        if (prev === "running" && remoteStatus === "idle") {
            onSyncSettledRef.current?.()
        }
    }, [remoteStatus])

    const markManualSyncStarted = useCallback(() => {
        setWarmingUp(true)
        setWarmupStart(Date.now())
        void fetchStatus()
    }, [fetchStatus])

    const isStalled = remoteStatus === "running" && lockedUntil && new Date(lockedUntil) < new Date()
    const isSyncBusy = warmingUp || remoteStatus === "running"

    return {
        remoteStatus,
        lastSyncedAt,
        totalReviews,
        averageRating,
        lockedUntil,
        isStalled,
        isSyncBusy,
        markManualSyncStarted,
        fetchStatus,
    }
}
