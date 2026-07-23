import {useEffect, useState} from "react";
import { createRecommendations, getTags } from "./lastfm/lastfmAPI";

const BASE_URL = "https://api.spotify.com/v1";

async function fetchSpotifyData(endpoint: string, accessToken: string | null) { // TODO: check type
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Spotify API error: ${response.status} ${errorBody}`);
    }
    return response.json();
}

async function getProfile(accessToken: string) {
    return await fetchSpotifyData("/me", accessToken);
}

export async function getTopItems(type: string, timeRange: string, limit: number, accessToken: string) {
    return await fetchSpotifyData("/me/top/" + type + "?time_range=" + timeRange + "&limit=" + limit, accessToken);
}

export function UserProfile() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        if (!token) return;

        getProfile(token).then(data => {
            setName(" " + data.display_name);
            setImageUrl(data.images[0].url);
    });
    }, []);

    return <div className="flex flex-col items-center sm:flex-row">
        {name && (
            <h1 className="scroll-m-20 break-words text-center text-4xl font-extrabold tracking-tight text-balance sm:pr-2 sm:text-6xl lg:text-8xl">
                {name}
            </h1>
        )}
        {imageUrl && (
            <img
                className="m-3 h-24 w-24 rounded-2xl object-cover sm:m-5 sm:h-[150px] sm:w-[150px]"
                src={imageUrl}
                alt={name ? `${name.trim()}'s Spotify profile` : "Spotify profile"}
                width={150}
                height={150}
            />
        )}
    </div>

}

type TopItemsProps = {
    type: string;
    timeRange: string;
};

export async function PreloadItems({ type, timeRange }: TopItemsProps) {
    const itemMap = new Map<string, [string, Set<string>]>();
    const token = sessionStorage.getItem("access_token");
    let topTags;
    if (!token) return itemMap;

    const data = await getTopItems(type, timeRange, 20, token);
    // TODO: check type
    await Promise.all(data.items.map(async (item: { name: string; artists: { name: string; }[]; album: { images: { url: string; }[]; }; images: { url: string; }[]; }) => {
        if (type=="artists") {
            topTags = await getTags(3, item.name);
        }
        else {
            topTags = await getTags(3, item.artists[0].name, item.name);
            if (topTags.size === 0) { // sometimes it's empty so we fall back onto artist tags
                topTags = await getTags(3, item.artists[0].name);
            }
        }
        const imageUrl = type === "tracks" ? item.album.images[0].url : item.images[0].url;

        itemMap.set(item.name, [imageUrl, topTags]);
    }));

    return itemMap;
}

interface ArtistItem {
    name: string;
    imageUrl: string;
    tags: string[];
}


export function TopItems({ topItems }: { topItems: ArtistItem[] }) {
    return (
        <div className="flex w-full flex-col gap-4">
            {topItems && topItems.map((artist, index) => (
                <div key={artist.name} className="flex w-full min-w-0 flex-row items-center">
                    <div className="w-7 shrink-0 pr-2 text-right text-sm font-black sm:w-12 sm:pr-4 sm:text-xl">
                        {index + 1}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-row items-center justify-between border-2 border-black bg-[#fdc6ff] p-2 shadow-[4px_4px_0_0_#000] sm:p-4">

                        <div className="flex min-w-0 flex-row items-center gap-3 sm:gap-4">
                            <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="h-14 w-14 shrink-0 border-2 border-black object-cover sm:h-20 sm:w-20 md:h-24 md:w-24"
                            />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-bold sm:text-xl" title={artist.name}>
                                    {artist.name}
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end flex-shrink-0 pl-4">
                            <div className="flex flex-wrap justify-end gap-2">
                                {artist.tags && artist.tags.slice(0, 3).map((tag) => (
                                    <div key={tag} className="px-2 py-1 bg-blue-200 border border-black rounded-full text-[10px] font-bold uppercase">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


export function usePopularity(limit: number): [number | null, [number, string][]] {
    const [averagePopularity, setAveragePopularity] = useState<number | null>(null);
    const [artistPopularity, setArtistPopularity] = useState<[number, string][]>([]);
    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        if (!token) return;

        getTopItems("artists", "medium_term", limit, token).then(data => {
            const items = data.items || [];
            let total = 0;

            const newEntries: [number, string][] = items.map((item: { popularity: number; name: string; }) => {
                total += item.popularity;
                return [item.popularity, item.name];
            });

            newEntries.sort((a, b) => b[0] - a[0]);

            setAveragePopularity(Math.round(total / limit));
            setArtistPopularity(newEntries);
        });
    }, [limit]);

    return [averagePopularity!, artistPopularity];
}

async function findSong(query: string): Promise<string | null> {
    const formattedQuery = `q=${encodeURIComponent(query)}`;
    const token = sessionStorage.getItem("access_token");

    try {
        const data = await fetchSpotifyData(`/search?${formattedQuery}&type=track&limit=1`, token);
        const songUri = data?.tracks?.items?.[0]?.uri;
        return songUri || null;
    } catch (error) {
        console.error(`Search failed for: ${query}`, error);
        return null;
    }
}

async function createSpotifyPlaylist(
    userId: string,
    accessToken: string,
    name: string,
    description: string,
    isPublic: boolean = false
) {
    const response = await fetch(`${BASE_URL}/users/${userId}/playlists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            description,
            public: isPublic,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Spotify API error: ${response.status} ${errorBody}`);
    }

    return response.json();
}

async function addTracksToPlaylist(
    playlistId: string,
    accessToken: string,
    uris: string[],
    position?: number
) {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uris,
            position,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Spotify API error: ${response.status} ${errorBody}`);
    }

    return response.json();
}

export async function createRecommendationPlaylist(limit: number, seed: string) {
    const recs = await createRecommendations(limit, seed);
    let playlistId = "";
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    const profile = await getProfile(token);
    const userId = profile.id;

    await createSpotifyPlaylist(userId, token, "SoundScope Recommendations", "", true).then(data => {
        playlistId = data.id;
    })
    console.log(recs);
    const uriResults = await Promise.all(recs.map(trackName => findSong(trackName)));
    const validUris = uriResults.filter((uri): uri is string => !!uri);
    if (validUris.length > 0) {
        await addTracksToPlaylist(playlistId, token, validUris);
    }
}
