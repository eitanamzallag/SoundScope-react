export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams({
        ...Object.fromEntries(searchParams),
        api_key: process.env.LASTFM_API_KEY!, // no longer needs NEXT_PUBLIC_
        format: "json",
    });

    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);
    const data = await response.json();
    return Response.json(data);
}