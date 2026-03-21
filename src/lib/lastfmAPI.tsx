import { getTopItems } from "./spotifyAPI"

const api_key = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callLastFm<T = any>(
    method: string,
    params: Record<string, string>
): Promise<T> {
    const searchParams = new URLSearchParams({
        method,
        api_key: api_key!,
        format: "json",
        ...params,
    });

    const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
    if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
}

async function getSimilarSong(track: string, artist: string): Promise<string> {
    let query: string = "";
    try {
        const data = await callLastFm("track.getSimilar", { track: track, artist: artist });
        // taking a recommendation from the middle so the recommendations aren't so literal (same artist/album, etc.)
        const factor = Math.floor(Math.random() * 5 + 3); // random number to divide by so it isn't deterministic. +3 to make sure it's relatively close to the top, otherwise it gives bad recommendations
        const index = Math.floor(data.similartracks.track.length / factor);
        query = data.similartracks.track[index].artist.name + " " + data.similartracks.track[index].name;
    }
    catch (error) {
        console.log(error);
        console.log(track);
    }
    return query;
}

async function getArtistTopTrack(artist: string): Promise<string> {
    let track: string = "";
    try {
        const data = await callLastFm("artist.getTopTracks", { artist: artist });
        track = data.toptracks.track[0].name;
    }
    catch (error) {
        console.log(error);
        console.log(track);
    }
    return track;
}

export async function createRecommendations(limit: number, seed: string): Promise<string[]> {
    const recommendations: string[] = [];
    const token = sessionStorage.getItem("access_token")!;

    if (seed == "surprise") {
        seed = Math.random() < 0.5 ? "artists" : "tracks"; // 50/50 chance of each
    }
    console.log(seed);
    const data = await getTopItems(seed, "medium_term", limit, token);
    let similar: string = "";
    console.log(data);
    for (let i = 0; i < data.items.length; i++) {
        if (seed == "tracks") {
            similar = await getSimilarSong(data.items[i].name, data.items[i].artists[0].name);
        }
        else {
            const track = await getArtistTopTrack(data.items[i].name);
            similar = await getSimilarSong(track, data.items[i].name);
        }
        recommendations.push(similar);
    }
    return recommendations;
}

export async function getTags(limit: number, artist: string, track?: string) {
    let data;
    if (track !== undefined) {
        data = await callLastFm("track.getTopTags", {track: track, artist: artist});
    }
    else {
        data = await callLastFm("artist.getTopTags", {artist: artist});
    }
    const songTags = new Set<string>();
    for (let i = 0; i < limit; i++) {
        try {
            songTags.add(data.toptags.tag[i].name);
        }
        catch (error) {} // the API can't handle Hebrew names
    }
    return songTags;
}

export async function getTopTags(limit: number) {
    const songsMap = new Map<string, string>();
    let tagSet = new Set<string>();
    const token = sessionStorage.getItem("access_token")!;

    const data = await getTopItems("tracks", "medium_term", limit, token);
    for (let i = 0; i < data.items.length; i++) {
        songsMap.set(data.items[i].artists[0].name, data.items[i].name);
        if (tagSet.size < limit) {
            const songTags = await getTags(3, data.items[i].artists[0].name, data.items[i].name);
            tagSet = tagSet.union(songTags);
        } else { break; }
    }
    console.log(tagSet);
    return tagSet;
}