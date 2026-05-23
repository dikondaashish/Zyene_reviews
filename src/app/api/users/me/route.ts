import { handleUserMeDelete, handleUserMePatch } from "@/services/users/me-api";

export async function PATCH(request: Request) {
    return handleUserMePatch(request);
}

export async function DELETE() {
    return handleUserMeDelete();
}
