import type { Metadata } from "next";
import { Suspense } from "react";
import { UtmCapture } from "@/components/marketing/utm-capture";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthShell>
            {children}
            <Suspense fallback={null}>
                <UtmCapture />
            </Suspense>
        </AuthShell>
    );
}
