import type { LucideIcon } from "lucide-react";
import { BarChart3, CreditCard, Megaphone, Plug, Rocket, Star } from "lucide-react";
import type { HelpCategory } from "@/lib/content/help-types";

const HELP_CATEGORY_ICON_BY_KEY: Record<HelpCategory, LucideIcon> = {
    "getting-started": Rocket,
    reviews: Star,
    campaigns: Megaphone,
    analytics: BarChart3,
    billing: CreditCard,
    integrations: Plug,
};

export function HelpCategoryIcon({
    category,
    className,
    size = 24,
}: {
    category: HelpCategory;
    className?: string;
    size?: number;
}) {
    const Icon = HELP_CATEGORY_ICON_BY_KEY[category];
    return <Icon aria-hidden="true" className={className} size={size} />;
}
