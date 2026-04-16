export const DASHBOARD_DEMO_DATA = {
    total_reviews: 128,
    average_rating: 4.8,
    responseRate: 98.4,
    pendingCount: 0,
    positivePercent: 92,
    negativePercent: 4,
    engagementRate: 15.2,
    requestsThisMonth: 120,
    newReviews30d: 24,
    recentReviews: [
        {
            id: "demo-1",
            author_name: "Sarah Jenkins",
            rating: 5,
            platform: "google",
            text: "Absolutely fantastic service! The team was professional and the results exceeded my expectations. Highly recommend to everyone in the area.",
            sentiment: "positive",
            review_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            response_status: "responded"
        },
        {
            id: "demo-2",
            author_name: "Michael Chen",
            rating: 5,
            platform: "google",
            text: "Great experience from start to finish. Very responsive and helpful staff.",
            sentiment: "positive",
            review_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            response_status: "responded"
        },
        {
            id: "demo-3",
            author_name: "Emily Rodriguez",
            rating: 4,
            platform: "google",
            text: "Very good service, just took a little longer than expected but the quality was worth it.",
            sentiment: "positive",
            review_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            response_status: "responded"
        }
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
        day: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) + 1
    })),
    ratingData: [
        { rating: 5, count: 95 },
        { rating: 4, count: 20 },
        { rating: 3, count: 8 },
        { rating: 2, count: 3 },
        { rating: 1, count: 2 }
    ]
};
