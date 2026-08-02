import LoginPage from "./page-client";

export default function Page() {
    const googleClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
        process.env.GOOGLE_CLIENT_ID?.trim() ||
        "";

    return <LoginPage googleClientId={googleClientId} />;
}
