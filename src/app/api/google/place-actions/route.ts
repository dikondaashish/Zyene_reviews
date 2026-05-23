import { type NextRequest } from "next/server";
import {
    handlePlaceActionsDelete,
    handlePlaceActionsGet,
    handlePlaceActionsPost,
} from "@/services/google/place-actions-api";

export async function GET(request: NextRequest) {
    return handlePlaceActionsGet(request);
}

export async function POST(request: Request) {
    return handlePlaceActionsPost(request);
}

export async function DELETE(request: Request) {
    return handlePlaceActionsDelete(request);
}
