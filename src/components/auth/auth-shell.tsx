import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { PrivacyChoicesButton } from "@/components/privacy/privacy-choices-button";
import "@/components/auth/auth-shell.css";
import "@/components/auth/auth-form.css";

/** Form column on the left (logo, form, legal), brand panel on the right from 1024px up. */
export function AuthShell({ children }: { children: ReactNode }) {
    return (
        <div className="auth-shell" data-app-palette>
            <a href="#auth-content" className="auth-skip">Skip to form</a>
            <div className="auth-layout">
                <div className="auth-form-column">
                    <header className="auth-header">
                        <ZyeneReviewsLogoLink href={MARKETING_SITE_ORIGIN} size={32} priority />
                        <Link href={`${MARKETING_SITE_ORIGIN}/help`} className="auth-help">
                            Need help? <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                    </header>
                    <main id="auth-content" className="auth-main" tabIndex={-1}>
                        <div className="auth-form-container">{children}</div>
                    </main>
                    <footer className="auth-footer">
                        <span>© {new Date().getFullYear()} Zyene, Inc.</span>
                        <nav aria-label="Legal">
                            <Link href={`${MARKETING_SITE_ORIGIN}/privacy`}>Privacy</Link>
                            <Link href={`${MARKETING_SITE_ORIGIN}/terms`}>Terms</Link>
                            <PrivacyChoicesButton className="auth-footer-button" />
                        </nav>
                    </footer>
                </div>
                <AuthBrandPanel />
            </div>
        </div>
    );
}
