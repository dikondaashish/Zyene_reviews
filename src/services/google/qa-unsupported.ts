import { isGoogleServiceError } from "./api-error";

/** Google Q&A is retired or unavailable for many listings (404 HTML or 501). */
export function isGoogleQaUnsupported(error: unknown): boolean {
    if (isGoogleServiceError(error)) {
        return (
            error.kind === "not_found" ||
            error.statusCode === 404 ||
            (error.statusCode === 501 &&
                (/API_UNSUPPORTED|UNIMPLEMENTED|no longer supported/i.test(error.message) ||
                    error.apiName.includes("Q&A")))
        );
    }
    const message = error instanceof Error ? error.message : String(error);
    return (
        (/\b501\b/.test(message) &&
            (/API_UNSUPPORTED|UNIMPLEMENTED|no longer supported/i.test(message) ||
                /mybusinessqanda\.googleapis\.com/i.test(message))) ||
        (/\b404\b/.test(message) &&
            (/Q&A|listQuestions|mybusinessqanda/i.test(message) ||
                /locations\/[^/\s]+\/questions/i.test(message)))
    );
}
