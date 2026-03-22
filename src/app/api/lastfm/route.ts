export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams({
        ...Object.fromEntries(searchParams),
        api_key: process.env.LASTFM_API_KEY!,
        format: "json",
    });

    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);

    if (!response.ok) {
        const text = await response.text();
        console.log("Last.fm error response:", text);
        return Response.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
}