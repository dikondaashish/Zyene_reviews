import { SMALL_BUSINESS_SETUP_STEPS } from "@/lib/marketing/small-business-content";

export function SmallBusinessSetupSection() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-[length:var(--fs-h2)] font-semibold mb-10">Up and running the same day</h2>
                <ol className="grid md:grid-cols-3 gap-6">
                    {SMALL_BUSINESS_SETUP_STEPS.map((step, index) => (
                        <li key={step.title} className="bg-card border border-border rounded-xl p-6">
                            <p className="text-sm font-bold text-primary mb-2">Step {index + 1}</p>
                            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
