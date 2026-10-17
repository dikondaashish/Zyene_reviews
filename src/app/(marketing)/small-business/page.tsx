import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/seo/marketing-page-metadata";
import {
    SMALL_BUSINESS_DESCRIPTION,
    SMALL_BUSINESS_KEYWORDS,
    SMALL_BUSINESS_PATH,
    SMALL_BUSINESS_TITLE,
} from "@/lib/marketing/small-business-content";
import PageView from "./page-view";

export const metadata: Metadata = buildMarketingMetadata({
    title: SMALL_BUSINESS_TITLE,
    description: SMALL_BUSINESS_DESCRIPTION,
    path: SMALL_BUSINESS_PATH,
    keywords: SMALL_BUSINESS_KEYWORDS,
});

export default PageView;
