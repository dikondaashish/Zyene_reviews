import type { LucideIcon } from "lucide-react";
import {
    Building2,
    Dumbbell,
    Home,
    Scissors,
    Smile,
    Stethoscope,
    Utensils,
    Wrench,
} from "lucide-react";

export const INDUSTRY_ICON_BY_SLUG: Record<string, LucideIcon> = {
    restaurants: Utensils,
    dental: Smile,
    "auto-repair": Wrench,
    salons: Scissors,
    "home-services": Home,
    medical: Stethoscope,
    hotels: Building2,
    fitness: Dumbbell,
};

const ICON_SIZE = 32;
const ICON_STROKE = 1.5;

type IndustryIconProps = {
    slug: string;
    className?: string;
    size?: number;
    strokeWidth?: number;
};

export function IndustryIcon({
    slug,
    className,
    size = ICON_SIZE,
    strokeWidth = ICON_STROKE,
}: IndustryIconProps) {
    const Icon = INDUSTRY_ICON_BY_SLUG[slug];
    if (!Icon) return null;
    return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}
