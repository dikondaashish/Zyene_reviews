import { NewsletterSignup } from "@/components/marketing/newsletter-signup";

export function BlogNewsletterCtaSection() {
    return (
        <section className="blog-newsletter-section" aria-labelledby="blog-newsletter-heading">
            <div className="marketing-container blog-newsletter-card">
                <div>
                    <p className="blog-grid-kicker">A little help, now and then</p>
                    <h2 id="blog-newsletter-heading">Get the latest guides in your inbox.</h2>
                    <p>Monthly ideas for earning trust, replying with care, and making local growth easier to manage.</p>
                </div>
                <NewsletterSignup source="blog" className="blog-newsletter-form" />
            </div>
        </section>
    );
}
