const YELP_BASE_URL = "https://api.yelp.com/v3";

function getApiKey(): string {
    const key = process.env.YELP_API_KEY;
    if (!key) {
        throw new Error("YELP_API_KEY environment variable is not set");
    }
    return key;
}

interface YelpRequestOptions {
    path: string;
    params?: Record<string, string>;
}

export async function yelpFetch<T>(options: YelpRequestOptions): Promise<T> {
    const apiKey = getApiKey();

    const url = new URL(`${YELP_BASE_URL}${options.path}`);
    if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Yelp API] ${response.status}: ${errorBody}`);
        throw new Error(
            `Yelp API error: ${response.status} ${response.statusText}`
        );
    }

    return response.json() as Promise<T>;
}
