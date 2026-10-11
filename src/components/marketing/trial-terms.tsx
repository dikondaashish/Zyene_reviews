import { TRIAL_SUMMARY } from "@/lib/marketing/trial-copy";

export function TrialTerms({ className = "mt-4 text-sm leading-relaxed text-muted-foreground" }: { className?: string }) {
    return <p className={className}>{TRIAL_SUMMARY}</p>;
}
