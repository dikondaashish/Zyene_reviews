"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mail, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";
import { SupportChatMessageText } from "@/components/marketing/support-chat/support-chat-message-text";
import { cn } from "@/lib/utils";
import { MAX_USER_MESSAGE_CHARS } from "@/lib/support-chat/constants";
import { setupAssistantStarters, SETUP_STEP_GUIDE, SUPPORT_EMAIL_ADDRESS } from "@/lib/support-chat/setup-assistant-copy";
import { useSetupAssistant } from "./use-setup-assistant";

/** "Ask Zyene AI": instant answers about the setup step the owner is on, with a person one click away. */
export function OnboardingAssistantPanel({ open, onOpenChange, step }: { open: boolean; onOpenChange: (open: boolean) => void; step: number }) {
    const { messages, suggestions, busy, ask } = useSetupAssistant(step);
    const [draft, setDraft] = useState("");
    const endRef = useRef<HTMLDivElement>(null);
    const chips = messages.length === 0 ? setupAssistantStarters(step) : suggestions;
    const stepName = SETUP_STEP_GUIDE[step]?.name ?? "setup";

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end" });
    }, [messages]);

    const send = (text: string) => {
        setDraft("");
        void ask(text);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                <SheetHeader className="flex-row items-center gap-3 border-b border-border px-5 py-4 text-left">
                    <ZyeneReviewsLogoMark size={36} className="rounded-full" />
                    <div className="min-w-0">
                        <SheetTitle className="text-base">Zyene AI</SheetTitle>
                        <SheetDescription className="text-xs">Instant answers while you set up</SheetDescription>
                    </div>
                </SheetHeader>

                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
                    <p className="rounded-xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                        Hi! I can help with the <strong>{stepName}</strong> step or anything else about Zyene. What would you like to know?
                    </p>
                    {messages.map((m) => (
                        <div key={m.id} className={cn("flex", m.role === "user" && "justify-end")}>
                            <div className={cn(
                                "max-w-[85%] space-y-2 px-4 py-3 text-sm leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4",
                                m.role === "user" ? "rounded-xl rounded-tr-sm bg-primary text-primary-foreground" : "rounded-xl rounded-tl-sm bg-muted text-foreground",
                            )}>
                                {m.pending && !m.content ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Thinking" /> : <SupportChatMessageText text={m.content} />}
                            </div>
                        </div>
                    ))}
                    {!busy && chips.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {chips.map((chip) => (
                                <button key={chip} type="button" onClick={() => send(chip)}
                                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}
                    <div ref={endRef} />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="space-y-2 border-t border-border px-5 py-3">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value.slice(0, MAX_USER_MESSAGE_CHARS))}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                            rows={1}
                            placeholder="Ask anything about your setup"
                            aria-label="Your question"
                            className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Send" className="size-10 shrink-0 rounded-lg">
                            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
                        </Button>
                    </div>
                    <p className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Sparkles className="size-3" aria-hidden />AI can make mistakes.</span>
                        <a href={`mailto:${SUPPORT_EMAIL_ADDRESS}?subject=${encodeURIComponent(`Help with setup: ${stepName} step`)}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                            <Mail className="size-3" aria-hidden />Email a person
                        </a>
                    </p>
                </form>
            </SheetContent>
        </Sheet>
    );
}
