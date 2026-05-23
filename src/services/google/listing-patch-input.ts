import { z } from "zod";
import { ApiRouteError } from "@/app/api/_shared/errors";
import { type PatchListingInput } from "@/services/google/listing-information";
import { patchListingSchema } from "./listing-schema";

export function buildPatchListingInput(parsed: z.infer<typeof patchListingSchema>): PatchListingInput {
    const { title, websiteUri, primaryPhone, description } = parsed;
    const input: PatchListingInput = {};
    if (typeof title === "string") {
        const t = title.trim();
        if (!t) {
            throw new ApiRouteError("Title cannot be empty", { status: 400, code: "INVALID_TITLE" });
        }
        input.title = t;
    }
    if (typeof websiteUri === "string") {
        const w = websiteUri.trim();
        if (w) {
            if (!/^https?:\/\//i.test(w)) {
                throw new ApiRouteError("Website must start with http:// or https://", {
                    status: 400,
                    code: "INVALID_WEBSITE",
                });
            }
            input.websiteUri = w;
        }
    }
    if (typeof primaryPhone === "string") {
        const p = primaryPhone.trim();
        if (p) {
            input.primaryPhone = p;
        }
    }
    if (typeof description === "string") {
        input.description = description.trim();
    }
    return input;
}
