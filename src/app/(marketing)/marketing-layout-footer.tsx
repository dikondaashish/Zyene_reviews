import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MarketingLayoutFooterBrand } from "@/app/(marketing)/marketing-layout-footer-brand";
import {
    MarketingLayoutFooterProductColumn,
    MarketingLayoutFooterSolutionsColumn,
} from "@/app/(marketing)/marketing-layout-footer-product-solutions";
import { MarketingLayoutFooterResourcesColumn } from "@/app/(marketing)/marketing-layout-footer-resources";
import {
    MarketingLayoutFooterCompanyColumn,
    MarketingLayoutFooterLegalColumn,
} from "@/app/(marketing)/marketing-layout-footer-company-legal";

export function MarketingLayoutFooter() {
    return (
        <footer className="marketing-footer mt-auto">
            <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-8">
                <div className="footer-signoff"><p>A better reputation.<br />A business people come back to.</p><Link href="/demo" className="marketing-button">Let’s talk about your business <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    <MarketingLayoutFooterBrand />
                    <MarketingLayoutFooterProductColumn />
                    <MarketingLayoutFooterSolutionsColumn />
                    <MarketingLayoutFooterResourcesColumn />
                    <MarketingLayoutFooterCompanyColumn />
                    <MarketingLayoutFooterLegalColumn />
                </div>
                <div className="footer-wordmark" aria-hidden="true">zyene.</div>
            </div>
        </footer>
    );
}
