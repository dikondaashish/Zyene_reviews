import Link from "next/link";
import { Store } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center max-w-md w-full">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Business Not Found</h2>
                <p className="text-slate-600 mb-6">
                    We couldn't find the business you're looking for. The link might be incorrect or the business may have been removed.
                </p>
                <div className="text-xs text-slate-400 border-t pt-4 mt-4">
                    <p>Debug Info: Review Flow 404</p>
                    <p>If you are the owner, please check your business slug in the dashboard.</p>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 hover:underline font-medium">
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
