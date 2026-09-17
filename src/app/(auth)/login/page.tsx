import LoginPage from "./page-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log in", description: "Log in to your Zyene Reviews workspace to manage reviews, replies, and customer feedback." };

export default function Page() {
    const googleClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
        process.env.GOOGLE_CLIENT_ID?.trim() ||
        "";

    return <LoginPage googleClientId={googleClientId} />;
}
