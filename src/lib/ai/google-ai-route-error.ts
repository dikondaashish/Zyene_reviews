import { NextResponse } from "next/server";

/**
 * Maps @google/generative-ai / Google API failures to HTTP responses.
 * See: https://ai.google.dev/gemini-api/docs/api-key — enable Generative Language API + key restrictions.
 */
export function nextResponseForGoogleAiError(
  error: unknown,
  genericUserMessage: string
): NextResponse {
  const msg = error instanceof Error ? error.message : String(error);

  if (!process.env.GOOGLE_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error: "AI is not configured on this server (missing GOOGLE_API_KEY).",
        code: "MISSING_GOOGLE_API_KEY",
      },
      { status: 503 }
    );
  }

  if (msg.includes("API_KEY_SERVICE_BLOCKED")) {
    return NextResponse.json(
      {
        error:
          "Gemini is blocked for this API key. In Google Cloud Console: open APIs & Services → enable “Generative Language API” for the linked project; then APIs & Services → Credentials → your API key → ensure “API restrictions” includes Generative Language API (or use “Don’t restrict key” only for server secrets).",
        code: "GOOGLE_API_BLOCKED",
      },
      { status: 503 }
    );
  }

  if (msg.includes("API_KEY_INVALID") || /API key not valid/i.test(msg)) {
    return NextResponse.json(
      {
        error: "The Google API key is invalid. Check GOOGLE_API_KEY in your deployment (e.g. Vercel) matches Google AI Studio / Cloud Console.",
        code: "INVALID_GOOGLE_API_KEY",
      },
      { status: 503 }
    );
  }

  if (msg.includes("429") || /resource_exhausted|quota/i.test(msg)) {
    return NextResponse.json(
      { error: "AI quota exceeded. Please try again in a few minutes.", code: "QUOTA_EXCEEDED" },
      { status: 429 }
    );
  }

  if (msg.includes("404") && /models\//i.test(msg)) {
    return NextResponse.json(
      {
        error:
          "Configured Gemini model is not available for this key. Set GOOGLE_AI_PRIMARY_MODEL / GOOGLE_AI_FALLBACK_MODEL to a supported model (e.g. gemini-2.0-flash).",
        code: "MODEL_NOT_FOUND",
      },
      { status: 503 }
    );
  }

  console.error("AI generation failed:", error);
  return NextResponse.json({ error: genericUserMessage }, { status: 500 });
}
