import { DocNavbar } from "@/components/docs/doc-navbar";
import { DocSidebar } from "@/components/docs/doc-sidebar";
import { WebSiteJsonLd } from "@/components/seo/json-ld-website";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans">
            <WebSiteJsonLd />
            <DocNavbar />
            <div className="flex flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8">
                <DocSidebar />
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
