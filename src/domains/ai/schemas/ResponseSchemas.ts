/**
 * Structured-output hints for prompts (Discovery Engine / Search summaries do not
 * enforce JSON Schema server-side — keep shapes in the prompt text).
 */
export const singleReplyJsonHint = `Return a JSON object: {"reply":"<string>"}`;

export const qaAnswerJsonHint = `Return a JSON object: {"answer":"<string>"}`;
