"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast, type ToastT } from "sonner";
import { Sparkles, Trophy } from "lucide-react";

interface MilestoneCelebrationProps {
    currentCount: number;
    type: "reviews" | "requests" | "rating";
    isDemo?: boolean;
    scopeKey?: string; // e.g. businessId, to avoid cross-business repeats
}

const MILESTONES = {
    reviews: [10, 25, 50, 100, 250, 500, 1000],
    requests: [100, 500, 1000, 5000],
    rating: [4.5, 4.8, 5.0]
};

export function MilestoneCelebration({ currentCount, type, isDemo, scopeKey }: MilestoneCelebrationProps) {
    const [lastMilestone, setLastMilestone] = useState<number | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (isDemo) return;
        
        // Initialize from localStorage to avoid repeats
        const storageKey = `zyene-milestone-${type}${scopeKey ? `-${scopeKey}` : ""}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setLastMilestone(Number(saved));
        }
        setIsInitialized(true);
    }, [type, scopeKey]);

    useEffect(() => {
        if (isDemo || !isInitialized || currentCount === 0) return;

        const milestones = MILESTONES[type];
        const reachedMilestone = milestones.findLast(m => currentCount >= m);

        if (reachedMilestone && (!lastMilestone || reachedMilestone > lastMilestone)) {
            // Trigger celebration!
            triggerCelebration(reachedMilestone, type);
            
            // Save to state and storage
            setLastMilestone(reachedMilestone);
            localStorage.setItem(
                `zyene-milestone-${type}${scopeKey ? `-${scopeKey}` : ""}`,
                reachedMilestone.toString()
            );
        }
    }, [currentCount, type, lastMilestone, isInitialized]);

    const triggerCelebration = (milestone: number, milestoneType: string) => {
        // Confetti!
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Toast Notification
        const message = milestoneType === "reviews" 
            ? `Incredible! You've reached ${milestone} total reviews! 🏆`
            : milestoneType === "requests" 
            ? `Amazing! You've sent ${milestone} review requests! 🚀`
            : `Phenomenal! Your business maintains a ${milestone} star rating! ⭐`;

        toast.custom((id) => (
            <div className="animate-in fade-in zoom-in w-[calc(100vw-1rem)] min-w-0 max-w-[420px] bg-background border-2 border-primary shadow-2xl rounded-xl sm:rounded-2xl pointer-events-auto flex flex-col sm:flex-row ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300">
                <div className="flex-1 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="bg-primary/20 p-2 rounded-full">
                                {milestoneType === "rating" ? <Sparkles className="h-6 w-6 text-primary" /> : <Trophy className="h-6 w-6 text-primary" />}
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-foreground">
                                Milestone Achieved!
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-t border-muted/50 sm:border-t-0 sm:border-l">
                    <button
                        type="button"
                        onClick={() => toast.dismiss(id)}
                        className="w-full border border-transparent rounded-none rounded-b-xl p-4 sm:rounded-b-none sm:rounded-r-2xl flex min-h-11 items-center justify-center text-sm font-semibold text-primary hover:bg-primary/5 transition-colors focus:outline-none cursor-pointer active:bg-primary/10"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    return null; // Side-effect only component
}
