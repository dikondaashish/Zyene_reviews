import { MarketingLayoutFooterBrand } from "./marketing-layout-footer-brand";
import {
    MarketingLayoutFooterProductColumn,
    MarketingLayoutFooterSolutionsColumn,
} from "./marketing-layout-footer-product-solutions";
import { MarketingLayoutFooterResourcesColumn } from "./marketing-layout-footer-resources";
import {
    MarketingLayoutFooterCompanyColumn,
    MarketingLayoutFooterLegalColumn,
} from "./marketing-layout-footer-company-legal";

export function MarketingLayoutFooter() {
    return (
        <footer className="mt-auto border-t border-border/70 bg-canvas">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8">
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    <MarketingLayoutFooterBrand />
                    <MarketingLayoutFooterProductColumn />
                    <MarketingLayoutFooterSolutionsColumn />
                    <MarketingLayoutFooterResourcesColumn />
                    <MarketingLayoutFooterCompanyColumn />
                    <MarketingLayoutFooterLegalColumn />
                </div>
            </div>
        </footer>
    );
}
