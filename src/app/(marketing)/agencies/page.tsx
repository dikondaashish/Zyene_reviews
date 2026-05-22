import { redirect } from "next/navigation";

/** Blueprint alias: /agencies → /partners */
export default function AgenciesRedirectPage() {
    redirect("/partners");
}
