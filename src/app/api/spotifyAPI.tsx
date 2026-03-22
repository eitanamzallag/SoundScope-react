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

    return <div className="flex flex-row items-center">
        <h1 className="whitespace-pre scroll-m-20 text-8xl font-extrabold tracking-tight text-balance pr-2">{name}</h1>
        <img className="m-5 rounded-2xl"
            src={imageUrl!}
            alt={name ?? "User profile image"}
            width={150}
            height={150}
        />
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
        <div className="flex flex-col w-full gap-4">
            {topItems && topItems.map((artist, index) => (
                <div key={artist.name} className="flex flex-row items-center w-full">
                    <div className="text-xl font-black text-right w-12 flex-shrink-0 pr-4">
                        {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-row justify-between items-center p-4 bg-[#fdc6ff] border-2 border-black shadow-[4px_4px_0_0_#000]">

                        <div className="flex flex-row items-center gap-4 min-w-0">
                            <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-20 h-20 md:w-24 md:h-24 object-cover border-2 border-black flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="text-xl font-bold truncate" title={artist.name}>
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
