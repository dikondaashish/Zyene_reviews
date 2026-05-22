import { permanentRedirect } from "next/navigation";

/** Blueprint alias → canonical case studies hub */
export default function CustomersRedirectPage() {
    permanentRedirect("/case-studies");
}
