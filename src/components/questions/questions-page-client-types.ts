export type GbpQuestionRow = {
    id: string;
    question_text: string;
    author_display_name: string | null;
    google_update_time: string | null;
    total_answer_count: number;
    has_merchant_answer: boolean;
    upvote_count: number;
};

export type QuestionsPageClientProps = {
    questions: GbpQuestionRow[];
    isDemo: boolean;
};
