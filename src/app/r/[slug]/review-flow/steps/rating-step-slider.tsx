export interface RatingStepSliderProps {
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStepSlider({ rating, hoverRating, onRate, onHoverRating }: RatingStepSliderProps) {
    return (
        <div className="w-full space-y-6 pt-4 pb-2 max-w-sm mx-auto">
            <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={rating !== null ? rating : hoverRating !== null ? hoverRating : 5}
                onChange={(e) => onHoverRating(parseInt(e.target.value))}
                onMouseUp={(e) => {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    onHoverRating(null);
                    onRate(val);
                }}
                onTouchEnd={(e) => {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    onHoverRating(null);
                    onRate(val);
                }}
                className="w-full cursor-pointer h-3 bg-muted rounded-lg appearance-none accent-primary hover:accent-primary transition-all touch-none"
                style={{ touchAction: "none" }}
            />
            <div className="flex justify-between text-xs sm:text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                <span>POOR</span>
                <span>EXCELLENT</span>
            </div>
        </div>
    );
}
