"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface TimeAgoProps {
    date: string | Date | number;
    addSuffix?: boolean;
    className?: string;
    fallback?: string;
}

/**
 * A hydration-safe TimeAgo component.
 * Renders a fallback (or formatted date) on the server to prevent hydration mismatches,
 * then updates to a relative "time ago" string after mounting on the client.
 */
export function TimeAgo({ 
    date, 
    addSuffix = true, 
    className = "",
    fallback = "..." 
}: TimeAgoProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!date) return null;

    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        return <span className={className}>{fallback}</span>;
    }

    if (!mounted) {
        // Return a stable representation for SSR and first client render
        return <span className={className}>{fallback}</span>;
    }

    return (
        <span className={className}>
            {formatDistanceToNow(dateObj, { addSuffix })}
        </span>
    );
}
