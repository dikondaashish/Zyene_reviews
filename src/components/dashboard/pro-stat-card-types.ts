export interface ProStatCardProps {
    title: string;
    value: number;
    iconName: "reviews" | "rating" | "response" | "pending" | "qa" | "links" | "completeness" | "lodging" | "alert";
    description?: string;
    trend?: number;
    trendFormat?: "percent" | "star_delta";
    trendLabel?: string;
    prefix?: string;
    suffix?: string;
    precision?: number;
    className?: string;
    delay?: number;
}
