const BENEFITS = [
    {
        title: "Reviews land in Zyene",
        body: "Google reviews sync into this dashboard so you can reply in one place.",
    },
    {
        title: "Low ratings stay private",
        body: "A 1–3 star tap can go to private feedback instead of a public Google review.",
    },
    {
        title: "Set up for this location",
        body: "We program the NFC tap and QR code with your review link. No app for customers.",
    },
] as const;

export function NfcOrderBenefits() {
    return (
        <section aria-label="Why order with Zyene Reviews" className="border-t border-border/70 pt-3">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Included with Zyene Reviews
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-3">
                {BENEFITS.map((item) => (
                    <li key={item.title} className="rounded-lg bg-muted/50 px-2.5 py-2">
                        <p className="text-xs font-semibold text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{item.body}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
