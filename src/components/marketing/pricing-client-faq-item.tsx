"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function PricingClientFaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border last:border-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex cursor-pointer items-center justify-between w-full py-5 text-left"
            >
                <span className="text-base font-medium text-foreground pr-4">{question}</span>
                <ChevronDown
                    className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""} size-5`}
                />
            </button>
            {open && <p className="pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>}
        </div>
    );
}
