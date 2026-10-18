import { Lightbulb, MessageSquareReply, Star, TrendingUp } from "lucide-react";

const SIGNALS = [
    { icon: Star, title: "Review activity", description: "Follow the number of new reviews and compare activity over time." },
    { icon: TrendingUp, title: "Rating trends", description: "See how your average rating changes as more customers share their experience." },
    { icon: MessageSquareReply, title: "Response rate", description: "Keep track of the conversations your team has answered and what still needs attention." },
    { icon: Lightbulb, title: "Customer feedback", description: "Look for recurring themes and use them to improve the next customer’s visit." },
];

export function HowItWorksProofPointsSection() {
    return (
        <section className="marketing-section" aria-labelledby="how-it-works-progress-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Progress</p>
                    <h2 id="how-it-works-progress-heading">Know what progress looks like.</h2>
                    <p>Follow the signals that matter to your business, and build a routine you can improve over time.</p>
                </div>
                <ul className="mi-cards" data-cols="4">
                    {SIGNALS.map(({ icon: Icon, title, description }) => (
                        <li key={title} className="mi-card">
                            <Icon size={20} aria-hidden="true" />
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
