import type { GbpQuestionRow } from "./questions-page-client-types";

export const DEMO_QUESTIONS: GbpQuestionRow[] = [
    {
        id: "demo-q1",
        question_text: "Do you offer same-day appointments?",
        author_display_name: "Jordan K.",
        google_update_time: new Date(Date.now() - 86400000 * 2).toISOString(),
        total_answer_count: 0,
        has_merchant_answer: false,
        upvote_count: 4,
    },
    {
        id: "demo-q2",
        question_text: "Is parking available on site?",
        author_display_name: "Sam T.",
        google_update_time: new Date(Date.now() - 86400000 * 5).toISOString(),
        total_answer_count: 1,
        has_merchant_answer: true,
        upvote_count: 2,
    },
    {
        id: "demo-q3",
        question_text: "What are your hours on Saturday?",
        author_display_name: "Alex M.",
        google_update_time: new Date(Date.now() - 86400000).toISOString(),
        total_answer_count: 0,
        has_merchant_answer: false,
        upvote_count: 1,
    },
];
