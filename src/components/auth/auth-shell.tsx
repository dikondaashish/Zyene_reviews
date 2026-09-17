import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import "@/components/auth/auth-shell.css";
import "@/components/auth/auth-form.css";

export function AuthShell({ children }: { children: ReactNode }) {
    return (
        <div className="auth-shell">
            <a href="#auth-content" className="auth-skip">Skip to form</a>
            <header className="auth-header">
                <ZyeneReviewsLogoLink href={MARKETING_SITE_ORIGIN} size={36} priority />
                <Link href={`${MARKETING_SITE_ORIGIN}/help`} className="auth-help">
                    Need help? <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </header>
            <div className="auth-layout">
                <AuthBrandPanel />
                <div className="auth-main-column">
                    <main id="auth-content" className="auth-main" tabIndex={-1}>
                        <div className="auth-form-container">{children}</div>
                    </main>
                    <footer className="auth-footer">
                        <span>© {new Date().getFullYear()} Zyene, Inc.</span>
                        <nav aria-label="Legal">
                            <Link href={`${MARKETING_SITE_ORIGIN}/privacy`}>Privacy</Link>
                            <Link href={`${MARKETING_SITE_ORIGIN}/terms`}>Terms</Link>
                        </nav>
                    </footer>
                </div>
            </div>
        </div>
    );
}
