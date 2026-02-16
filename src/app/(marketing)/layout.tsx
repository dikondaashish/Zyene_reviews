import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-xl text-slate-900"
                    >
                        <span className="text-blue-600">Zyene</span> Ratings
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
                        <Link href="#features" className="hover:text-blue-600 transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="hover:text-blue-600 transition-colors">
                            Pricing
                        </Link>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/login" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`} className="hover:text-blue-600 transition-colors">
                            Log In
                        </Link>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                                Start Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </nav>

                    {/* Mobile Menu Button - simple placeholder for now */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <span className="sr-only">Toggle menu</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </Button>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t bg-slate-50 py-12">
                <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <Link href="/" className="font-bold text-lg text-slate-900 mb-4 block">
                                <span className="text-blue-600">Zyene</span> Ratings
                            </Link>
                            <p className="text-sm text-slate-500 mb-4">
                                Made for restaurant owners who want more 5-star reviews without the hassle.
                            </p>
                            <p className="text-sm text-slate-400">
                                © {new Date().getFullYear()} Zyene Inc.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><Link href="#features" className="hover:text-blue-600">Features</Link></li>
                                <li><Link href="#pricing" className="hover:text-blue-600">Pricing</Link></li>
                                <li><Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/login" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`} className="hover:text-blue-600">Log In</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
