import { toast } from "sonner";
import { disconnectGoogle } from "@/app/(dashboard)/settings/integrations/_actions";

export async function runGoogleCardDisconnect(platformId: string): Promise<void> {
    try {
        await disconnectGoogle(platformId);
    } catch (err: unknown) {
        const digest =
            err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : "";
        if (digest.startsWith("NEXT_REDIRECT")) {
            return;
        }
        toast.error(err instanceof Error ? err.message : "Failed to disconnect");
    }
}
