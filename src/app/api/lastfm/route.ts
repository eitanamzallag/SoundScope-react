const TRANSIENT_STATUSES = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const UPSTREAM_TIMEOUT_MS = 8_000;

function wait(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apiKey = process.env.LASTFM_API_KEY;

    if (!apiKey) {
        return Response.json({ error: "Last.fm API key is not configured." }, { status: 500 });
    }

    const params = new URLSearchParams({
        ...Object.fromEntries(searchParams),
        api_key: apiKey,
        format: "json",
    });
    const upstreamUrl = `https://ws.audioscrobbler.com/2.0/?${params}`;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(upstreamUrl, {
                signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
                next: { revalidate: 60 * 60 * 24 },
            });

            if (response.ok) {
                const data = await response.json();
                return Response.json(data, {
                    headers: {
                        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
                    },
                });
            }

            const text = await response.text();
            const shouldRetry = TRANSIENT_STATUSES.has(response.status) && attempt < MAX_ATTEMPTS - 1;
            if (!shouldRetry) {
                return Response.json({ error: text || "Last.fm request failed." }, { status: response.status });
            }

            const retryAfter = Number(response.headers.get("retry-after"));
            const backoff = Number.isFinite(retryAfter) && retryAfter > 0
                ? retryAfter * 1_000
                : 300 * (2 ** attempt) + Math.random() * 200;
            await wait(backoff);
        } catch {
            const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
            if (isLastAttempt) {
                return Response.json({ error: "Last.fm did not respond in time." }, { status: 504 });
            }

            await wait(300 * (2 ** attempt) + Math.random() * 200);
        }
    }

    return Response.json({ error: "Last.fm request failed." }, { status: 503 });
}
