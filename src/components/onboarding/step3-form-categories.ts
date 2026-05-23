import {
    BedDouble,
    Car,
    Coffee,
    Dumbbell,
    HeartPulse,
    MoreHorizontal,
    Scissors,
    ShoppingBag,
    Sparkles,
    Stethoscope,
    UtensilsCrossed,
} from "lucide-react";

export const STEP3_CATEGORIES = [
    { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
    { value: "coffee", label: "Coffee / Cafe", icon: Coffee },
    { value: "salon", label: "Salon / Beauty", icon: Scissors },
    { value: "dental", label: "Dental", icon: Stethoscope },
    { value: "gym", label: "Gym / Fitness", icon: Dumbbell },
    { value: "spa", label: "Spa", icon: Sparkles },
    { value: "hotel", label: "Hotel", icon: BedDouble },
    { value: "retail", label: "Retail", icon: ShoppingBag },
    { value: "automotive", label: "Automotive", icon: Car },
    { value: "healthcare", label: "Healthcare", icon: HeartPulse },
    { value: "other", label: "Other", icon: MoreHorizontal },
] as const;
