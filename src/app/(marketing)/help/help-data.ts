import Link from "next/link";
import type { Metadata } from "next";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpCategory,
} from "@/lib/content/help-data";

export const CATEGORY_ORDER: HelpCategory[] = [
    "getting-started",
    "reviews",
    "campaigns",
    "analytics",
    "billing",
    "integrations",
];
