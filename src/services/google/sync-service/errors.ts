export class GooglePlatformAccessError extends Error {
    readonly code: string;
    readonly status: number;

    constructor(message: string, code: string, status: number, cause?: unknown) {
        super(message);
        this.name = "GooglePlatformAccessError";
        this.code = code;
        this.status = status;
        if (cause !== undefined) {
            Object.defineProperty(this, "cause", { value: cause, enumerable: false });
        }
    }
}

export class GooglePlatformLookupError extends GooglePlatformAccessError {
    constructor(options?: { cause?: unknown }) {
        super(
            "Google connection is temporarily unavailable. Please try again.",
            "GOOGLE_CONNECTION_UNAVAILABLE",
            503,
            options?.cause,
        );
        this.name = "GooglePlatformLookupError";
    }
}

export class GooglePlatformNotFoundError extends GooglePlatformAccessError {
    constructor() {
        super("Google is not connected for this business.", "GOOGLE_NOT_CONNECTED", 404);
        this.name = "GooglePlatformNotFoundError";
    }
}
