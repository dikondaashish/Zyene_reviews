import {
    BarChart3,
    Home,
    MessageSquare,
    PanelLeft,
    Settings,
    Users,
    type LucideIcon,
} from "lucide-react";
import type { TourStepIcon } from "@/lib/tours/dashboard-tour";

/** Same Lucide icons as the dashboard sidebar for each tour step. */
export const TOUR_STEP_ICON_MAP: Record<TourStepIcon, LucideIcon> = {
    "panel-left": PanelLeft,
    home: Home,
    "message-square": MessageSquare,
    users: Users,
    "bar-chart-3": BarChart3,
    settings: Settings,
};
