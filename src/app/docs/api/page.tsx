import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Code2,
    Send,
    MessageSquare,
    BarChart3,
    Key,
    Shield,
    AlertTriangle,
    ArrowLeft,
    Copy,
    Zap,
    BookOpen,
    Terminal,
    QrCode,
    Megaphone,
    ListChecks,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Code Block Component ──
function CodeBlock({
    language,
    title,
    code,
}: {
    language: string;
    title?: string;
    code: string;
}) {
    return (
        <div className="rounded-lg border bg-slate-950 overflow-hidden">
            {title && (
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/50">
                    <span className="text-xs font-medium text-slate-400">
                        {title}
                    </span>
                    <Badge
                        variant="outline"
                        className="text-[10px] text-slate-500 border-slate-700"
                    >
                        {language}
                    </Badge>
                </div>
            )}
            <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                <code className="text-slate-300 font-mono text-[13px]">
                    {code}
                </code>
            </pre>
        </div>
    );
}

// ── Method Badge ──
function MethodBadge({ method }: { method: string }) {
    const colors: Record<string, string> = {
        GET: "bg-blue-100 text-blue-700 border-blue-300",
        POST: "bg-green-100 text-green-700 border-green-300",
        PUT: "bg-yellow-100 text-yellow-700 border-yellow-300",
        DELETE: "bg-red-100 text-red-700 border-red-300",
        PATCH: "bg-purple-100 text-purple-700 border-purple-300",
    };

    return (
        <Badge
            variant="outline"
            className={`font-mono text-xs px-2 py-0.5 ${colors[method] || ""}`}
        >
            {method}
        </Badge>
    );
}

// ── Parameter Row ──
function ParamRow({
    name,
    type,
    required,
    description,
}: {
    name: string;
    type: string;
    required?: boolean;
    description: string;
}) {
    return (
        <tr className="border-b border-slate-100 last:border-0">
            <td className="py-2.5 pr-4">
                <code className="text-sm font-mono text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                    {name}
                </code>
            </td>
            <td className="py-2.5 pr-4">
                <span className="text-sm text-muted-foreground">{type}</span>
            </td>
            <td className="py-2.5 pr-4">
                {required ? (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                        Required
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                        Optional
                    </Badge>
                )}
            </td>
            <td className="py-2.5">
                <span className="text-sm text-muted-foreground">
                    {description}
                </span>
            </td>
        </tr>
    );
}

// ── Endpoint Section ──
function EndpointSection({
    id,
    method,
    path,
    title,
    description,
    icon: Icon,
    children,
}: {
    id: string;
    method: string;
    path: string;
    title: string;
    description: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-20">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 bg-slate-50 rounded-lg p-3 border">
                        <MethodBadge method={method} />
                        <code className="text-sm font-mono text-slate-700">
                            {path}
                        </code>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">{children}</CardContent>
            </Card>
        </section>
    );
}

// ── Page ──
export default function ApiDocsPage() {
    const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = baseUrl.includes("localhost") ? "http" : "https";
    const fullBaseUrl = `${protocol}://${baseUrl}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/integrations">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <Separator
                                orientation="vertical"
                                className="h-6"
                            />
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                                    <Code2 className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold tracking-tight">
                                        API Documentation
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className="text-xs gap-1 font-mono"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            v1.0
                        </Badge>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Introduction */}
                        <section className="space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Zyene Reviews API
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-2xl">
                                    Integrate review management into your
                                    applications. Send review requests, retrieve
                                    reviews, and access analytics
                                    programmatically.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                                    <Shield className="h-4 w-4 text-green-600 shrink-0" />
                                    <span className="text-sm font-medium">
                                        API Key Auth
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                                    <Zap className="h-4 w-4 text-yellow-600 shrink-0" />
                                    <span className="text-sm font-medium">
                                        REST + JSON
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                                    <Terminal className="h-4 w-4 text-violet-600 shrink-0" />
                                    <span className="text-sm font-medium">
                                        HTTPS Only
                                    </span>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Authentication */}
                        <section id="authentication" className="space-y-4 scroll-mt-20">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                <h2 className="text-2xl font-bold">
                                    Authentication
                                </h2>
                            </div>
                            <p className="text-muted-foreground">
                                All API requests require an API key. Generate one
                                from the{" "}
                                <Link
                                    href="/integrations"
                                    className="text-violet-600 underline underline-offset-2"
                                >
                                    Integrations page
                                </Link>
                                . Include it in the{" "}
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono">
                                    Authorization
                                </code>{" "}
                                header of every request.
                            </p>
                            <CodeBlock
                                language="HTTP"
                                title="Authorization Header"
                                code={`Authorization: Bearer zy_your_api_key_here`}
                            />
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800 text-sm">
                                        Keep your API key secure
                                    </p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Never expose your API key in
                                        client-side code, public repositories,
                                        or browser requests. Always make API
                                        calls from your backend server.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Base URL */}
                        <section id="base-url" className="space-y-4 scroll-mt-20">
                            <h2 className="text-2xl font-bold">Base URL</h2>
                            <p className="text-muted-foreground">
                                All API endpoints are relative to the following
                                base URL:
                            </p>
                            <CodeBlock
                                language="text"
                                title="Base URL"
                                code={`${fullBaseUrl}/api`}
                            />
                        </section>

                        <Separator />

                        {/* Endpoint 1: Send Review Request */}
                        <EndpointSection
                            id="send-request"
                            method="POST"
                            path="/api/requests/send"
                            title="Send Review Request"
                            description="Send an SMS or email review request to a customer. Automatically checks opt-outs, frequency caps, and plan limits."
                            icon={Send}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">
                                                    Parameter
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Required
                                                </th>
                                                <th className="py-2">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow
                                                name="businessId"
                                                type="string"
                                                required
                                                description="The ID of the business sending the request"
                                            />
                                            <ParamRow
                                                name="customerName"
                                                type="string"
                                                description="Customer's name for personalization"
                                            />
                                            <ParamRow
                                                name="customerPhone"
                                                type="string"
                                                required
                                                description="Customer phone number (E.164 format, e.g. +1234567890)"
                                            />
                                            <ParamRow
                                                name="channel"
                                                type="string"
                                                description={`Delivery channel: "sms" (default) or "email"`}
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/requests/send \\
  -H "Authorization: Bearer zy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "businessId": "biz_abc123",
    "customerName": "Jane Smith",
    "customerPhone": "+14155551234",
    "channel": "sms"
  }'`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "id": "req_7f3a9b2c",
  "business_id": "biz_abc123",
  "customer_name": "Jane Smith",
  "customer_phone": "+14155551234",
  "channel": "sms",
  "status": "sent",
  "sent_at": "2025-01-15T10:30:00Z",
  "created_at": "2025-01-15T10:30:00Z"
}`}
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Error Responses
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        {
                                            code: "400",
                                            msg: "Customer has opted out / Already sent recently",
                                        },
                                        {
                                            code: "401",
                                            msg: "Missing or invalid API key",
                                        },
                                        {
                                            code: "403",
                                            msg: "Business not found or monthly limit reached",
                                        },
                                        {
                                            code: "500",
                                            msg: "Failed to send SMS",
                                        },
                                    ].map((err) => (
                                        <div
                                            key={err.code}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs text-red-600 border-red-200"
                                            >
                                                {err.code}
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {err.msg}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </EndpointSection>

                        {/* Endpoint 2: Sync Google Reviews */}
                        <EndpointSection
                            id="sync-reviews"
                            method="POST"
                            path="/api/sync/google"
                            title="Sync Google Reviews"
                            description="Trigger a manual sync of Google reviews for the active business. Fetches the latest reviews from Google Business Profile."
                            icon={MessageSquare}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    No request body required. The business is
                                    determined from your authenticated session.
                                </p>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/sync/google \\
  -H "Authorization: Bearer zy_your_api_key"`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "synced": 12,
  "message": "Successfully synced 12 reviews"
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 3: AI Suggest Reply */}
                        <EndpointSection
                            id="suggest-reply"
                            method="POST"
                            path="/api/ai/suggest-reply"
                            title="AI Suggest Reply"
                            description="Generate an AI-powered reply suggestion for a review using your business context and tone settings."
                            icon={Zap}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">
                                                    Parameter
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Required
                                                </th>
                                                <th className="py-2">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow
                                                name="reviewId"
                                                type="string"
                                                required
                                                description="The ID of the review to generate a reply for"
                                            />
                                            <ParamRow
                                                name="tone"
                                                type="string"
                                                description={`Reply tone: "professional", "friendly", "empathetic" (default: "professional")`}
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/ai/suggest-reply \\
  -H "Authorization: Bearer zy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reviewId": "rev_xyz789",
    "tone": "friendly"
  }'`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "reply": "Thank you so much for your kind words, Jane! We're thrilled you enjoyed your experience..."
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 4: Post Reply */}
                        <EndpointSection
                            id="post-reply"
                            method="POST"
                            path="/api/reviews/{id}/reply"
                            title="Post Review Reply"
                            description="Post a reply to a specific review. The reply is saved locally and, if connected, published to the review platform."
                            icon={MessageSquare}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    URL Parameters
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">
                                                    Parameter
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Required
                                                </th>
                                                <th className="py-2">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow
                                                name="id"
                                                type="string"
                                                required
                                                description="The review ID"
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">
                                                    Parameter
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Required
                                                </th>
                                                <th className="py-2">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow
                                                name="replyText"
                                                type="string"
                                                required
                                                description="The reply content to post"
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/reviews/rev_xyz789/reply \\
  -H "Authorization: Bearer zy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "replyText": "Thank you for your feedback! We appreciate your kind words."
  }'`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "success": true,
  "message": "Reply posted successfully"
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 5: AI Analyze Review */}
                        <EndpointSection
                            id="analyze-review"
                            method="POST"
                            path="/api/ai/analyze"
                            title="Analyze Review (AI)"
                            description="Run AI analysis on a review to extract sentiment, urgency score, topics, and a suggested reply."
                            icon={BarChart3}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">
                                                    Parameter
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Required
                                                </th>
                                                <th className="py-2">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow
                                                name="reviewText"
                                                type="string"
                                                required
                                                description="The review text to analyze"
                                            />
                                            <ParamRow
                                                name="rating"
                                                type="number"
                                                required
                                                description="Rating (1-5) of the review"
                                            />
                                            <ParamRow
                                                name="businessName"
                                                type="string"
                                                description="Business name for context"
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/ai/analyze \\
  -H "Authorization: Bearer zy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reviewText": "The food was amazing but the wait was too long",
    "rating": 3,
    "businessName": "Joe'\''s Diner"
  }'`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "sentiment": "mixed",
  "urgency_score": 5,
  "topics": ["food quality", "wait time"],
  "suggested_reply": "Thank you for your feedback! We're glad you loved the food..."
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 6: Get Business */}
                        <EndpointSection
                            id="get-business"
                            method="GET"
                            path="/api/businesses/{id}"
                            title="Get Business Details"
                            description="Retrieve details about a specific business including settings, slug, and connected platforms."
                            icon={BookOpen}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    URL Parameters
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">
                                                    Parameter
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4">
                                                    Required
                                                </th>
                                                <th className="py-2">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow
                                                name="id"
                                                type="string"
                                                required
                                                description="The business ID"
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl ${fullBaseUrl}/api/businesses/biz_abc123 \\
  -H "Authorization: Bearer zy_your_api_key"`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "id": "biz_abc123",
  "name": "Joe's Diner",
  "slug": "joes-diner",
  "total_reviews": 142,
  "average_rating": 4.3,
  "google_place_id": "ChIJ...",
  "review_request_frequency_cap_days": 30,
  "created_at": "2025-01-01T00:00:00Z"
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 7: Generate QR Code */}
                        <EndpointSection
                            id="qr-code"
                            method="GET"
                            path="/api/businesses/{id}/qr-code"
                            title="Generate QR Code"
                            description="Generate a QR code image (as a Data URL) that links to your business review page. Embed this in print materials, receipts, or signage."
                            icon={QrCode}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    URL Parameters
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">Parameter</th>
                                                <th className="py-2 pr-4">Type</th>
                                                <th className="py-2 pr-4">Required</th>
                                                <th className="py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow name="id" type="string" required description="The business ID" />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl ${fullBaseUrl}/api/businesses/biz_abc123/qr-code \\
  -H "Authorization: Bearer zy_your_api_key"`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "reviewUrl": "https://yourdomain.com/joes-diner"
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 8: List Campaigns */}
                        <EndpointSection
                            id="list-campaigns"
                            method="GET"
                            path="/api/campaigns"
                            title="List Campaigns"
                            description="Retrieve all campaigns for your business, ordered by creation date (newest first)."
                            icon={ListChecks}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    No request body required. The business is determined from your authenticated session.
                                </p>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl ${fullBaseUrl}/api/campaigns \\
  -H "Authorization: Bearer zy_your_api_key"`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "campaigns": [
    {
      "id": "camp_abc123",
      "business_id": "biz_abc123",
      "name": "Summer Feedback Drive",
      "status": "active",
      "trigger_type": "manual_batch",
      "channel": "sms",
      "total_sent": 150,
      "created_at": "2025-06-01T10:00:00Z"
    }
  ]
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 9: Create Campaign */}
                        <EndpointSection
                            id="create-campaign"
                            method="POST"
                            path="/api/campaigns"
                            title="Create Campaign"
                            description="Create a new review request campaign. Campaigns let you batch-send review requests to multiple contacts with customizable templates."
                            icon={Megaphone}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">Parameter</th>
                                                <th className="py-2 pr-4">Type</th>
                                                <th className="py-2 pr-4">Required</th>
                                                <th className="py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow name="name" type="string" required description="Campaign name (max 255 chars)" />
                                            <ParamRow name="status" type="string" description={`"draft" (default), "active", or "paused"`} />
                                            <ParamRow name="trigger_type" type="string" description={`"manual_batch" (default), "scheduled", or "pos_payment"`} />
                                            <ParamRow name="channel" type="string" description={`"sms" (default), "email", or "both"`} />
                                            <ParamRow name="sms_template" type="string" description="SMS message template. Use {customer_name}, {business_name}, {review_link} placeholders" />
                                            <ParamRow name="email_subject" type="string" description="Email subject line (max 255 chars)" />
                                            <ParamRow name="email_template" type="string" description="Email body HTML template with placeholders" />
                                            <ParamRow name="delay_minutes" type="number" description="Delay before sending (default: 0)" />
                                            <ParamRow name="follow_up_enabled" type="boolean" description="Enable follow-up messages (default: false)" />
                                            <ParamRow name="follow_up_delay_hours" type="number" description="Hours before follow-up (default: 48)" />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/campaigns \\
  -H "Authorization: Bearer zy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Feedback Drive",
    "status": "active",
    "channel": "sms",
    "sms_template": "Hi {customer_name}! Thanks for visiting {business_name}. Share your experience: {review_link}"
  }'`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="201 Created"
                                    code={`{
  "campaign": {
    "id": "camp_abc123",
    "business_id": "biz_abc123",
    "name": "Summer Feedback Drive",
    "status": "active",
    "trigger_type": "manual_batch",
    "channel": "sms",
    "total_sent": 0,
    "created_at": "2025-06-01T10:00:00Z"
  }
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 10: Get Campaign */}
                        <EndpointSection
                            id="get-campaign"
                            method="GET"
                            path="/api/campaigns/{id}"
                            title="Get Campaign Details"
                            description="Retrieve a specific campaign with its associated review requests and delivery status for each contact."
                            icon={Megaphone}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    URL Parameters
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">Parameter</th>
                                                <th className="py-2 pr-4">Type</th>
                                                <th className="py-2 pr-4">Required</th>
                                                <th className="py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow name="id" type="string" required description="The campaign ID" />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl ${fullBaseUrl}/api/campaigns/camp_abc123 \\
  -H "Authorization: Bearer zy_your_api_key"`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "campaign": {
    "id": "camp_abc123",
    "name": "Summer Feedback Drive",
    "status": "active",
    "channel": "sms",
    "total_sent": 150
  },
  "requests": [
    {
      "id": "req_001",
      "customer_name": "Jane Smith",
      "customer_phone": "+14155551234",
      "channel": "sms",
      "status": "sent",
      "sent_at": "2025-06-01T11:00:00Z"
    }
  ]
}`}
                                />
                            </div>
                        </EndpointSection>

                        {/* Endpoint 11: Send Campaign */}
                        <EndpointSection
                            id="send-campaign"
                            method="POST"
                            path="/api/campaigns/{id}/send"
                            title="Send Campaign"
                            description="Send a campaign to a list of contacts. Automatically handles opt-out checks, frequency caps, plan limits, and template personalization. Max 500 contacts per request."
                            icon={Send}
                        >
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    URL Parameters
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">Parameter</th>
                                                <th className="py-2 pr-4">Type</th>
                                                <th className="py-2 pr-4">Required</th>
                                                <th className="py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow name="id" type="string" required description="The campaign ID (must be in 'active' status)" />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Request Body
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <th className="py-2 pr-4">Parameter</th>
                                                <th className="py-2 pr-4">Type</th>
                                                <th className="py-2 pr-4">Required</th>
                                                <th className="py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <ParamRow name="contacts" type="array" required description="Array of contact objects (1–500 items)" />
                                            <ParamRow name="contacts[].name" type="string" description="Contact's name for template personalization" />
                                            <ParamRow name="contacts[].phone" type="string" description="Phone number (required for SMS channel)" />
                                            <ParamRow name="contacts[].email" type="string" description="Email address (required for email channel)" />
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <CodeBlock
                                language="cURL"
                                title="Example Request"
                                code={`curl -X POST ${fullBaseUrl}/api/campaigns/camp_abc123/send \\
  -H "Authorization: Bearer zy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contacts": [
      { "name": "Jane Smith", "phone": "+14155551234" },
      { "name": "John Doe", "phone": "+14155555678" },
      { "name": "Sarah Lee", "email": "sarah@example.com" }
    ]
  }'`}
                            />

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Response
                                </h4>
                                <CodeBlock
                                    language="JSON"
                                    title="200 OK"
                                    code={`{
  "sent": 2,
  "skipped": 1,
  "failed": 0,
  "reasons": [
    "+14155555678: Sent recently (30d cap)"
  ]
}`}
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                                    Error Responses
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { code: "400", msg: "Invalid data or campaign is not active" },
                                        { code: "401", msg: "Missing or invalid API key" },
                                        { code: "404", msg: "Campaign or business not found" },
                                        { code: "500", msg: "Failed to send" },
                                    ].map((err) => (
                                        <div key={err.code} className="flex items-center gap-3 text-sm">
                                            <Badge variant="outline" className="font-mono text-xs text-red-600 border-red-200">
                                                {err.code}
                                            </Badge>
                                            <span className="text-muted-foreground">{err.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </EndpointSection>

                        <Separator />

                        {/* Rate Limiting */}
                        <section id="rate-limits" className="space-y-4 scroll-mt-20">
                            <h2 className="text-2xl font-bold">
                                Rate Limits
                            </h2>
                            <p className="text-muted-foreground">
                                API requests are subject to rate limiting based
                                on your plan. If you exceed the limit, you will
                                receive a{" "}
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">
                                    429 Too Many Requests
                                </code>{" "}
                                response.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border rounded-lg overflow-hidden">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b">
                                            <th className="py-3 px-4 text-sm font-medium">
                                                Plan
                                            </th>
                                            <th className="py-3 px-4 text-sm font-medium">
                                                Requests / Minute
                                            </th>
                                            <th className="py-3 px-4 text-sm font-medium">
                                                Review Requests / Month
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm">
                                                Free
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                10
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                10
                                            </td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm">
                                                Starter
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                60
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                100
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-sm">
                                                Growth
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                120
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                Unlimited
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <Separator />

                        {/* Error Codes */}
                        <section id="errors" className="space-y-4 scroll-mt-20">
                            <h2 className="text-2xl font-bold">Error Codes</h2>
                            <p className="text-muted-foreground">
                                All errors follow a consistent format with an
                                HTTP status code and a descriptive message.
                            </p>
                            <CodeBlock
                                language="JSON"
                                title="Error Response Format"
                                code={`{
  "error": "Human-readable error message"
}`}
                            />
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border rounded-lg overflow-hidden">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b">
                                            <th className="py-3 px-4 text-sm font-medium">
                                                Code
                                            </th>
                                            <th className="py-3 px-4 text-sm font-medium">
                                                Meaning
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                "400",
                                                "Bad Request — Missing fields, opt-out, frequency cap",
                                            ],
                                            [
                                                "401",
                                                "Unauthorized — Missing or invalid API key",
                                            ],
                                            [
                                                "403",
                                                "Forbidden — Access denied or plan limit exceeded",
                                            ],
                                            [
                                                "404",
                                                "Not Found — Resource does not exist",
                                            ],
                                            [
                                                "429",
                                                "Too Many Requests — Rate limit exceeded",
                                            ],
                                            [
                                                "500",
                                                "Internal Server Error — Something went wrong",
                                            ],
                                        ].map(([code, meaning]) => (
                                            <tr
                                                key={code}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono"
                                                    >
                                                        {code}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {meaning}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Navigation */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-20 space-y-1">
                            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3 px-3">
                                On this page
                            </p>
                            {[
                                {
                                    id: "authentication",
                                    label: "Authentication",
                                },
                                { id: "base-url", label: "Base URL" },
                                {
                                    id: "send-request",
                                    label: "Send Review Request",
                                },
                                {
                                    id: "sync-reviews",
                                    label: "Sync Google Reviews",
                                },
                                {
                                    id: "suggest-reply",
                                    label: "AI Suggest Reply",
                                },
                                {
                                    id: "post-reply",
                                    label: "Post Review Reply",
                                },
                                {
                                    id: "analyze-review",
                                    label: "Analyze Review (AI)",
                                },
                                {
                                    id: "get-business",
                                    label: "Get Business Details",
                                },
                                {
                                    id: "qr-code",
                                    label: "Generate QR Code",
                                },
                                {
                                    id: "list-campaigns",
                                    label: "List Campaigns",
                                },
                                {
                                    id: "create-campaign",
                                    label: "Create Campaign",
                                },
                                {
                                    id: "get-campaign",
                                    label: "Get Campaign Details",
                                },
                                {
                                    id: "send-campaign",
                                    label: "Send Campaign",
                                },
                                { id: "rate-limits", label: "Rate Limits" },
                                { id: "errors", label: "Error Codes" },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-slate-100"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
