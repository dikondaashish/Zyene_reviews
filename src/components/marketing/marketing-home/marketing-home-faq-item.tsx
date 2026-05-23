"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function MarketingHomeFaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border last:border-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex cursor-pointer items-center justify-between w-full py-5 text-left"
            >
                <span className="text-lg font-medium text-foreground">{question}</span>
                <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && <p className="pb-5 text-muted-foreground leading-relaxed">{answer}</p>}
        </div>
    );
}
