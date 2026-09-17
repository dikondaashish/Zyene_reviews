import { Check, MessageSquareText, Sparkles, Star } from "lucide-react";

export function AuthBrandPanel() {
    return (
        <aside className="auth-brand" aria-label="A look inside Zyene Reviews">
            <div className="auth-brand-copy">
                <p className="auth-eyebrow"><span /> YOUR REPUTATION, IN GOOD HANDS</p>
                <h2>Great experiences.<br />Lasting impressions.</h2>
                <p>Bring your reviews, replies, and customer feedback together. Make every conversation count.</p>
            </div>
            <figure className="auth-preview">
                <div className="auth-preview-top">
                    <span><MessageSquareText size={16} aria-hidden="true" /> Your review inbox</span>
                    <span className="auth-example-label">Example</span>
                </div>
                <div className="auth-review">
                    <div className="auth-review-person">
                        <span className="auth-avatar">JM</span>
                        <div><strong>Jordan M.</strong><span>Google review</span></div>
                        <span className="auth-stars" aria-label="5 out of 5 stars">
                            {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill="currentColor" aria-hidden="true" />)}
                        </span>
                    </div>
                    <blockquote>“Great coffee, a warm welcome, and a team that remembers your name. Already looking forward to my next visit.”</blockquote>
                </div>
                <div className="auth-reply">
                    <div className="auth-reply-label"><Sparkles size={15} aria-hidden="true" /> A reply that sounds like you</div>
                    <p>Thanks, Jordan! It means a lot to be part of your day. We’ll have your favorite ready next time.</p>
                    <span><Check size={14} aria-hidden="true" /> Ready for your review</span>
                </div>
                <figcaption>Sample review and AI draft. You’re in control.</figcaption>
            </figure>
            <div className="auth-brand-bottom">
                <span>Listen closely.</span><span>Reply thoughtfully.</span><span>Grow together.</span>
            </div>
        </aside>
    );
}
