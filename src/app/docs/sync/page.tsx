import type { Metadata } from "next";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export const metadata: Metadata = {
    title: "Sync Networks",
    description: "How Zyene Reviews syncs reviews from Google Business Profile, Yelp, and Facebook. Sync frequency, OAuth scopes, and troubleshooting.",
    alternates: { canonical: "https://zyenereviews.com/docs/sync" },
    openGraph: { title: "Sync Networks — Zyene Reviews Docs", description: "How Zyene syncs reviews from Google, Yelp, and Facebook — frequency, OAuth, and troubleshooting.", url: "https://zyenereviews.com/docs/sync" },
    twitter: { card: "summary_large_image", title: "Sync Networks — Zyene Reviews Docs", description: "Review sync from Google, Yelp, and Facebook — frequency, OAuth, troubleshooting." },
};

export default function DocsSyncNetworksPage() {
    const toc: TocItem[] = [
        { title: "Google", href: "#google" },
        { title: "Other platforms", href: "#other" },
        { title: "Reliability", href: "#reliability" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Concepts
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Sync Networks</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Sync Networks</h1>
                        <p>
                            Sync networks are the authenticated connections that let Zyene read and (where supported) write back to
                            each platform.
                        </p>

                        <h2 id="google">Google</h2>
                        <p>
                            Google Business Profile uses OAuth. After you connect, Zyene can list locations, import reviews, and post
                            replies subject to Google quotas and policy.
                        </p>

                        <h2 id="other">Other platforms</h2>
                        <p>
                            Additional integrations (Yelp, Facebook, and others) follow the same pattern: connect, verify, then
                            background sync keeps data aligned.
                        </p>

                        <h2 id="reliability">Reliability</h2>
                        <p>
                            Sync jobs record status on the platform row. If a token expires, the UI prompts for reconnect so API
                            consumers are not left with silent gaps.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
