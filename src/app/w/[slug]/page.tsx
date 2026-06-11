import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex-metadata";
import PageView from "./page-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Review Widget",
    robots: NOINDEX_ROBOTS,
};

export default PageView;
