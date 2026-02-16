import Link from "next/link";
import { Star } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                            <Star className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                            Zyene Ratings
                        </span>
                    </Link>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
