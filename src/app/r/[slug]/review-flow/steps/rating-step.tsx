import { RatingStepBusinessHeader } from "./rating-step-business-header";
import { RatingStepEmoji } from "./rating-step-emoji";
import { RatingStepNumber } from "./rating-step-number";
import { RatingStepRadio } from "./rating-step-radio";
import { RatingStepSlider } from "./rating-step-slider";
import { RatingStepStars } from "./rating-step-stars";

export interface RatingStepProps {
    businessName: string;
    logoUrl?: string;
    initials: string;
    resolvedBrandColor: string;
    ratingSubtitle?: string;
    welcomeMsg?: string;
    ratingStyle: string;
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStep({
    businessName,
    logoUrl,
    initials,
    resolvedBrandColor,
    ratingSubtitle,
    welcomeMsg,
    ratingStyle,
    rating,
    hoverRating,
    onRate,
    onHoverRating,
}: RatingStepProps) {
    const ratingControlProps = { rating, hoverRating, onRate, onHoverRating };

    return (
        <div className="px-8 py-10 space-y-8">
            <RatingStepBusinessHeader
                businessName={businessName}
                logoUrl={logoUrl}
                initials={initials}
                resolvedBrandColor={resolvedBrandColor}
                ratingSubtitle={ratingSubtitle}
            />

            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground leading-tight px-4 whitespace-pre-line">
                    {welcomeMsg || "How was your experience?"}
                </h2>
            </div>

            {ratingStyle === "emoji" && <RatingStepEmoji {...ratingControlProps} />}
            {ratingStyle === "stars" && <RatingStepStars {...ratingControlProps} />}
            {ratingStyle === "number" && <RatingStepNumber {...ratingControlProps} />}
            {ratingStyle === "slider" && <RatingStepSlider {...ratingControlProps} />}
            {ratingStyle === "radio" && <RatingStepRadio rating={rating} onRate={onRate} />}
        </div>
    );
}
