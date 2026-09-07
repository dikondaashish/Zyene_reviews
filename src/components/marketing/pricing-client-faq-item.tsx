import { ChevronDown } from "lucide-react";

export function PricingClientFaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <details className="group border-b border-border last:border-0">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="text-base font-medium text-foreground">{question}</span>
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </details>
    );
}
