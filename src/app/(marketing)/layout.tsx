import { Geist } from "next/font/google";
import { MarketingLayoutClient } from "@/app/(marketing)/marketing-layout-client";
import { WebSiteJsonLd } from "@/components/seo/json-ld-website";

/* Marketing-only type voice. The signed-in app keeps Inter (docs/DESIGN.md). */
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <WebSiteJsonLd />
            <MarketingLayoutClient fontClassName={geist.variable}>{children}</MarketingLayoutClient>
        </>
    );
}
