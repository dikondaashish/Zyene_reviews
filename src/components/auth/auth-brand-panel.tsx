import { AuthReviewScene } from "@/components/auth/auth-review-scene";

export function AuthBrandPanel() {
    return (
        <aside className="auth-brand" aria-label="A look inside Zyene Reviews">
            <div className="auth-brand-copy">
                <p className="auth-eyebrow"><span /> YOUR REVIEW INBOX, LIVE</p>
                <h2>Every review heard.<br /><em>Every reply on brand.</em></h2>
                <p>Google, Facebook and Yelp reviews land in one place, with replies drafted in your voice and ratings you can watch climb.</p>
            </div>
            <AuthReviewScene />
        </aside>
    );
}
