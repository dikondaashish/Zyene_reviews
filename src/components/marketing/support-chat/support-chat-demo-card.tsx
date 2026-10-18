"use client";

import { CalendarCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { SupportChatDemoForm } from "@/components/marketing/support-chat/support-chat-demo-form";
import { DEFAULT_CAL_COM_BOOKING_URL } from "@/lib/enterprise/cal-com-embed";
import type { StoredChatMessage } from "@/lib/support-chat/client-storage";

interface SlotDay {
    date: string;
    slots: string[];
}

interface DemoCardProps {
    message: StoredChatMessage;
    sessionId: string;
    defaultName: string;
    defaultEmail: string;
    pagePath?: string;
    onResolve: (id: string, result: StoredChatMessage["widgetResult"], summary?: string, lead?: { name: string; email: string }) => void;
}

const timeZone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
    } catch {
        return "America/Los_Angeles";
    }
};
const dayLabel = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
export const slotLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export function SupportChatDemoCard({ message, sessionId, defaultName, defaultEmail, pagePath, onResolve }: DemoCardProps) {
    const [days, setDays] = useState<SlotDay[] | null>(null);
    const [dayIndex, setDayIndex] = useState(0);
    const [slot, setSlot] = useState<string | null>(null);
    const bookedAt = message.widgetResult?.bookedAt;

    useEffect(() => {
        if (bookedAt) return;
        let cancelled = false;
        fetch(`/api/marketing/chat/demo-slots?tz=${encodeURIComponent(timeZone())}`)
            .then((res) => res.json() as Promise<{ days?: SlotDay[] }>)
            .then((data) => !cancelled && setDays(data.days ?? []))
            .catch(() => !cancelled && setDays([]));
        return () => {
            cancelled = true;
        };
    }, [bookedAt]);

    if (bookedAt) {
        return (
            <div className="support-chat-card support-chat-card--done">
                <CalendarCheck size={18} aria-hidden="true" />
                <p><strong>Demo booked</strong><br />{dayLabel(bookedAt.slice(0, 10))} at {slotLabel(bookedAt)}. Check your inbox for the invite.</p>
            </div>
        );
    }
    if (days === null) {
        return <div className="support-chat-card support-chat-card--loading"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Finding open times…</div>;
    }
    if (days.length === 0) {
        return (
            <div className="support-chat-card">
                <p className="support-chat-card__title">Book a demo</p>
                <p className="support-chat-card__hint">I couldn&apos;t load times here. Pick one on our calendar instead:</p>
                <a className="support-chat-action" href={DEFAULT_CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer">Open the calendar</a>
            </div>
        );
    }

    const day = days[Math.min(dayIndex, days.length - 1)];
    return (
        <div className="support-chat-card" aria-label="Book a 15-minute demo">
            <p className="support-chat-card__title">Book a 15-minute demo</p>
            <div className="support-chat-days" role="tablist" aria-label="Day">
                {days.map((d, i) => (
                    <button key={d.date} type="button" role="tab" aria-selected={i === dayIndex} onClick={() => { setDayIndex(i); setSlot(null); }}>
                        {dayLabel(d.date)}
                    </button>
                ))}
            </div>
            <div className="support-chat-slots" aria-label="Time">
                {day.slots.slice(0, 12).map((s) => (
                    <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)}>{slotLabel(s)}</button>
                ))}
            </div>
            {slot ? (
                <SupportChatDemoForm
                    slot={slot}
                    timeZone={timeZone()}
                    sessionId={sessionId}
                    pagePath={pagePath}
                    defaultName={defaultName}
                    defaultEmail={defaultEmail}
                    onBooked={(name, email) => onResolve(
                        message.id,
                        { bookedAt: slot },
                        `You're all set, ${name.split(/\s+/)[0]}! Your demo is on ${dayLabel(slot.slice(0, 10))} at ${slotLabel(slot)}. A calendar invite is on its way to ${email}.`,
                        { name, email },
                    )}
                />
            ) : null}
        </div>
    );
}
