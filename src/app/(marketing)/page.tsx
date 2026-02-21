import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Zap,
  Star,
  LayoutDashboard,
  Clock,
  DollarSign,
  ShieldCheck,
  Smartphone
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center w-full">

      {/* HERO SECTION */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Know About Every Review in <span className="text-blue-600">15 Minutes</span>. Not 5 Days.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Real-time SMS alerts, AI-powered replies, and more 5-star reviews — built for business owners at $39/mo, not $300/mo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-blue-600/20 w-full sm:w-auto">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[16/8]">
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
              <div className="text-center p-8">
                <LayoutDashboard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Dashboard Preview</p>
              </div>
            </div>
            {/* Optional: Use an actual screenshot if available later */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              95% of happy customers never leave a review.
              <br className="hidden md:block" />
              <span className="text-red-600">The unhappy ones always do.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 text-red-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">5-Day Discovery Lag</h3>
              <p className="text-slate-600 leading-relaxed">
                Most owners find bad reviews days after they're posted. By then, hundreds of potential customers have seen it.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Review Overwhelm</h3>
              <p className="text-slate-600 leading-relaxed">
                Managing Google, Yelp, and Facebook separately wastes hours. You miss notifications and forget to reply.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-slate-200 rounded-xl flex items-center justify-center mb-6 text-slate-700">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Expensive Tools</h3>
              <p className="text-slate-600 leading-relaxed">
                Birdeye charges $300/mo. Podium charges more. You're a business owner, not an enterprise software buyer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="w-full py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            {/* Feature 1 */}
            <div className="flex flex-col md:items-start items-center">
              <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant SMS Alerts</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Get texted within 15 minutes of any bad review. Never be blindsided again. catch issues before they go viral.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:items-start items-center">
              <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Replies</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                One-click AI-generated responses in your voice. Professional, empathetic, or friendly tone—you decide.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:items-start items-center">
              <div className="h-14 w-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Smartphone className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Get More 5-Star Reviews</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Send customers a quick SMS after their visit. One tap for them to leave a Google review. Watch your rating climb.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">Success in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-white border-4 border-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-sm text-2xl font-bold z-10">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Connect Google</h3>
              <p className="text-slate-600">
                One click to link your Google Business Profile. We sync your data instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-white border-4 border-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-sm text-2xl font-bold z-10">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Get Alerted</h3>
              <p className="text-slate-600">
                Instant SMS when reviews come in. Our AI analyzes sentiment and urgency for you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-white border-4 border-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-sm text-2xl font-bold z-10">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reply & Grow</h3>
              <p className="text-slate-600">
                AI suggests the perfect reply. Send review requests to happy customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="w-full py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-slate-900">$0<span className="text-lg font-normal text-slate-500">/mo</span></div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> 1 Location
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> Google Only
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> 10 Review Requests/mo
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> Email Alerts
                </li>
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full" variant="outline">Start Free</Button>
              </Link>
            </div>

            {/* Starter Tier */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-xl relative flex flex-col scale-105 z-10">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-slate-900">$39<span className="text-lg font-normal text-slate-500">/mo</span></div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-slate-900 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> 1 Location
                </li>
                <li className="flex items-center text-slate-900 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> All Platforms
                </li>
                <li className="flex items-center text-slate-900 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> 100 Review Requests/mo
                </li>
                <li className="flex items-center text-slate-900 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> SMS + Email Alerts
                </li>
                <li className="flex items-center text-slate-900 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> 30 AI Replies/mo
                </li>
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11">Get Started</Button>
              </Link>
            </div>

            {/* Growth Tier */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Growth</h3>
                <div className="text-4xl font-bold text-slate-900">$79<span className="text-lg font-normal text-slate-500">/mo</span></div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> 3 Locations
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> Unlimited Requests
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> Unlimited AI Replies
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> Team Access
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" /> Priority Support
                </li>
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full py-24 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Start managing your reviews in 5 minutes
          </h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
            Join hundreds of business owners who save time and grow their business with Zyene.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `http://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 h-14 rounded-full font-bold shadow-xl">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-blue-200 text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>No credit card required for trial</span>
          </div>
        </div>
      </section>

    </div>
  );
}
