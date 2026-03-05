"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff } from "lucide-react"

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (error === "account_not_created") {
            toast.error("Account Not Created", {
                description: "You must connect a Google Business Profile to create an account."
            })
        }
    }, [error])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setIsLoading(false)
            toast.error("Error", {
                description: error.message,
            })
            return
        }

        // Redirect to dashboard subdomain
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
        const protocol = rootDomain.includes("localhost") ? "http" : "https"
        window.location.href = `${protocol}://app.${rootDomain}`
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Welcome back
                </h1>
                <p className="text-gray-500">
                    Enter your credentials to access your dashboard
                </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        required
                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter your password"
                            className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                    Sign up
                </Link>
            </p>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
