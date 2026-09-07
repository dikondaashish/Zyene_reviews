const SIGNALS = [
    { title: "Review activity", description: "Follow the number of new reviews and compare activity over time." },
    { title: "Rating trends", description: "See how your average rating changes as more customers share their experience." },
    { title: "Response rate", description: "Keep track of the conversations your team has answered and what still needs attention." },
    { title: "Customer feedback", description: "Look for recurring themes and use them to improve the next customer’s visit." },
];

export function HowItWorksProofPointsSection() {
    return (
        <section className="marketing-section bg-muted">
            <div className="marketing-container">
                <div className="marketing-section-heading"><h2>Know what progress<br />looks like.</h2><p>Follow the signals that matter to your business, and build a routine you can improve over time.</p></div>
                <div className="grid gap-x-16 sm:grid-cols-2">{SIGNALS.map(signal => <article key={signal.title} className="border-t border-border py-7"><h3 className="mb-3 text-xl font-semibold">{signal.title}</h3><p className="max-w-lg text-muted-foreground">{signal.description}</p></article>)}</div>
            </div>
        </section>
    );
}
