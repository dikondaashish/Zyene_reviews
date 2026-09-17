import { useId } from "react";

export interface RatingStepSliderProps {
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStepSlider({ rating, hoverRating, onRate, onHoverRating }: RatingStepSliderProps) {
    const id = useId();
    const value = hoverRating ?? rating ?? 5;
    return (
        <div className="mx-auto w-full max-w-sm space-y-6 py-2">
            <label htmlFor={id} className="block text-center text-sm font-medium text-foreground">
                Your rating: {value} out of 5 stars
            </label>
            <input id={id} type="range" min="1" max="5" step="1" value={value}
                aria-valuetext={`${value} out of 5 stars`}
                onChange={e => onHoverRating(Number(e.target.value))}
                className="h-11 w-full cursor-pointer rounded-lg accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" />
            <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
                <span>Poor</span><span>Excellent</span>
            </div>
            <button type="button" onClick={() => onRate(value)}
                className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                Continue with {value} {value === 1 ? "star" : "stars"}
            </button>
        </div>
    );
}
