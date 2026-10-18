import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FreeToolShellProps {
    title: string;
    lede: string;
    whyTitle: string;
    why: ReactNode;
    children: ReactNode;
}

/** Top of every free tool page: copy and context on the left, the tool itself on the right. */
export function FreeToolShell({ title, lede, whyTitle, why, children }: FreeToolShellProps) {
    return (
        <section className="marketing-section tool-shell">
            <div className="marketing-container tool-shell-grid">
                <div className="tool-shell-copy">
                    <Link href="/tools" className="home-text-link tool-shell-back">
                        <ArrowLeft size={14} aria-hidden="true" /> All free tools
                    </Link>
                    <p className="marketing-eyebrow">Free tool</p>
                    <h1>{title}</h1>
                    <p className="tool-shell-lede">{lede}</p>
                </div>
                <div className="tool-shell-tool">{children}</div>
                <div className="tool-shell-why">
                    <h2>{whyTitle}</h2>
                    {why}
                </div>
            </div>
        </section>
    );
}
