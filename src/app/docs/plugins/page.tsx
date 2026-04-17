import Link from "next/link";
import { DocCodeBlock } from "@/components/docs/doc-code-block";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";
import { BASE_URL } from "@/config/env";

export default function DocsPluginsPage() {
    const embedBase = `${BASE_URL}/w`;
    const toc: TocItem[] = [
        { title: "Embeds", href: "#embeds" },
        { title: "Automations", href: "#automations" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Product
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Plugins &amp; embeds</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Plugins &amp; embeds</h1>
                        <p>
                            First-party surfaces today are the dashboard, public review routes, and embeddable widgets configured per
                            business.
                        </p>

                        <h2 id="embeds">Embeds</h2>
                        <p>
                            Carousel and badge widgets load from your Zyene site (same host as the dashboard). Replace{" "}
                            <code>your-business-slug</code> with the slug from Settings; copy the full iframe snippet from{" "}
                            <strong>Integrations</strong> when you want the exact markup.
                        </p>
                        <DocCodeBlock
                            language="bash"
                            code={`# Example widget base URL (iframe src uses the same origin + path)
${embedBase}/your-business-slug`}
                        />

                        <h2 id="automations">Automations</h2>
                        <p>
                            Zapier-style workflows can call the generic webhook endpoints documented in the dashboard or use the
                            Developer API directly from your workers. See{" "}
                            <Link href="/docs/api" className="text-primary underline underline-offset-4">
                                API Reference
                            </Link>{" "}
                            for authentication.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
