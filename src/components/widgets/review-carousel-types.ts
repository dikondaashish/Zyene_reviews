export interface CarouselReview {
    id: string;
    author_name: string;
    rating: number;
    content: string;
    platform: string;
    created_at: string;
    external_url?: string;
}

export interface ReviewCarouselProps {
    reviews: CarouselReview[];
    businessName: string;
}
