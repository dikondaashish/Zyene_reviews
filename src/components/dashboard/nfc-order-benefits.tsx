import { Inbox, ShieldCheck, Sparkles } from "lucide-react";

const BENEFITS = [
    {
        icon: Inbox,
        title: "Reviews land in Zyene",
        body: "New Google reviews sync here so you can reply in one place.",
    },
    {
        icon: ShieldCheck,
        title: "Low ratings stay private",
        body: "A 1–3 star tap routes to private feedback, not a public review.",
    },
    {
        icon: Sparkles,
        title: "Set up for this location",
        body: "We program the NFC chip and QR code with your review link.",
    },
] as const;

export function NfcOrderBenefits() {
    return (
        <section
            aria-label="Included with Zyene Reviews"
            className="border-t border-border/60 bg-secondary/30 px-4 py-3.5 sm:px-5"
        >
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Included with Zyene Reviews
            </p>
            <ul className="mt-2.5 grid gap-3 sm:grid-cols-3">
                {BENEFITS.map((item) => (
                    <li key={item.title} className="flex gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <item.icon className="size-3.5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[12.5px] font-semibold text-foreground">
                                {item.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                                {item.body}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
