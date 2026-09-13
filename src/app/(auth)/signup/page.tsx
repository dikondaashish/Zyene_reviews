import SignupPage from "./page-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create an account", description: "Create your Zyene Reviews account and start your 7-day free trial." };

export default function Page() {
    const googleClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
        process.env.GOOGLE_CLIENT_ID?.trim() ||
        "";

    return <SignupPage googleClientId={googleClientId} />;
}
