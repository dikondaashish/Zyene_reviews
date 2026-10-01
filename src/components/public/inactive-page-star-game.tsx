"use client";

import { useState } from "react";
import { Check, Copy, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const TARGETS = [4, 0, 8, 2, 6];

export function InactivePageStarGame({ businessName }: { businessName: string }) {
    const [score, setScore] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
    const complete = score === TARGETS.length;
    const message = `Hi! I tried to leave a review for ${businessName}, but your review page isn’t active. Could you activate it so customers can share their feedback?`;

    async function copyMessage() {
        try {
            await navigator.clipboard.writeText(message);
            setCopyState("copied");
        } catch {
            setCopyState("error");
        }
    }

    return (
        <section aria-labelledby="review-visitor-heading" className="border-t border-border px-6 py-6 sm:px-8">
            <div className="space-y-2">
                <h2 id="review-visitor-heading" className="text-sm font-semibold">Help the owner get this page ready</h2>
                <p className="text-xs leading-5 text-muted-foreground">Let them know you stopped by to leave a review.</p>
                <Button type="button" variant="outline" className="min-h-11 w-full gap-2 whitespace-normal rounded-lg" onClick={copyMessage}>
                    {copyState === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                    {copyState === "copied" ? "Message copied" : "Copy a message for the owner"}
                </Button>
                <p role="status" className="text-xs leading-5 text-muted-foreground">
                    {copyState === "copied" ? "Ready to paste into a message to the business." : copyState === "error" ? "Couldn’t copy automatically. Select and copy the message below." : "Copy it, then send it to the business yourself."}
                </p>
                {copyState === "error" && <textarea aria-label="Message for the business owner" readOnly value={message} rows={4} className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm" onFocus={(event) => event.currentTarget.select()} />}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                <div>
                    <h3 id="star-game-heading" className="text-sm font-semibold">A little fun before you go</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Catch five stars. Just a game, not a review.</p>
                </div>
                <Star className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </div>

            {!playing ? (
                <Button type="button" variant="outline" className="mt-4 min-h-11 w-full rounded-xl" onClick={() => setPlaying(true)}>
                    Play catch the stars
                </Button>
            ) : (
                <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3 px-1">
                        <p role="status" className="text-xs font-medium">
                            {complete ? "Five stars caught. Nicely done!" : `${score} / 5 stars · Tap the star`}
                        </p>
                        <button type="button" aria-label="Restart star game" className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setScore(0)}>
                            <RotateCcw className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="relative grid grid-cols-3 gap-2" aria-label="Star game board">
                        {Array.from({ length: 9 }, (_, index) => (
                            <div key={index} className="flex h-14 items-center justify-center rounded-xl bg-background/70">
                                {complete && index === 4 ? (
                                    <Check className="size-7 text-primary" aria-hidden="true" />
                                ) : <span className="size-1 rounded-full bg-border" aria-hidden="true" />}
                            </div>
                        ))}
                        {!complete && (
                            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2">
                                <button type="button" aria-label={`Catch star ${score + 1} of 5`} style={{ gridColumn: TARGETS[score] % 3 + 1, gridRow: Math.floor(TARGETS[score] / 3) + 1 }} className="pointer-events-auto flex size-12 touch-manipulation items-center justify-center self-center justify-self-center rounded-xl text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring motion-safe:active:scale-95" onClick={() => setScore((current) => Math.min(current + 1, 5))}>
                                    <Star className="size-8 fill-current" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </section>
    );
}
