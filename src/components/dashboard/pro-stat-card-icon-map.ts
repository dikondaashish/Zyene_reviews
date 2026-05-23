import {
    AlertTriangle,
    BarChart3,
    BedDouble,
    Clock,
    HelpCircle,
    Link2,
    ListChecks,
    MessageSquare,
    Star,
} from "lucide-react";

export const PRO_STAT_CARD_ICON_MAP = {
    reviews: MessageSquare,
    rating: Star,
    response: BarChart3,
    pending: Clock,
    qa: HelpCircle,
    links: Link2,
    completeness: ListChecks,
    lodging: BedDouble,
    alert: AlertTriangle,
} as const;
