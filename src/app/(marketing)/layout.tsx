import { MarketingLayoutClient } from "@/app/(marketing)/marketing-layout-client";
import { WebSiteJsonLd } from "@/components/seo/json-ld-website";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <WebSiteJsonLd />
            <MarketingLayoutClient>{children}</MarketingLayoutClient>
        </>
    );
}
