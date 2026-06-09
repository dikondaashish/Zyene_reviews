export type ErrorCode = "RATE_LIMIT" | "CONFLICT" | string;

export interface CodedError extends Error {
    code: ErrorCode;
}

export function createCodedError(message: string, code: ErrorCode): CodedError {
    const error = new Error(message) as CodedError;
    error.code = code;
    return error;
}
