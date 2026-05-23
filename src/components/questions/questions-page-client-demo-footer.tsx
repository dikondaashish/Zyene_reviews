import Link from "next/link";

export function QuestionsPageClientDemoFooter() {
    return (
        <p className="text-center text-xs text-muted-foreground">
            Showing sample Q&A.{" "}
            <Link href="/settings/integrations" className="text-primary underline underline-offset-2">
                Connect Google
            </Link>{" "}
            to load real questions.
        </p>
    );
}
