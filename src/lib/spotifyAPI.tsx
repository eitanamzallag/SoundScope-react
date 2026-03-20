import {JSX, useEffect, useState} from "react";
import { createRecommendations, getTags } from "./lastfmAPI";

const BASE_URL = "https://api.spotify.com/v1";

async function fetchSpotifyData(endpoint: string, accessToken: any) {
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
            src={imageUrl!} //TODO: check if i can trust that i can unwrap it always
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
    await Promise.all(data.items.map(async (item: any) => {
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
        <div className="flex flex-col flex-grow gap-4 place-content-center">
            {topItems && topItems.map((artist, index) => (
                <div key={artist.name} className="flex items-center">

                    <div className="text-lg font-semibold">{index + 1}</div>

                    <div className="flex grow flex-row justify-between ml-5 p-2 mb-2 bg-[#fdc6ff] border-2 border-black">
                        <div className="flex flex-col items-center">
                            <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-32 h-32 object-cover"
                            />
                            <div className="text-lg font-semibold">{artist.name}</div>
                        </div>

                        <div className="justify-items-center content-center pr-10">
                            <div className="text-sm font-semibold pb-2 text-gray-500">Tags:</div>
                            <div className="flex flex-row">

                                {artist.tags && artist.tags.map((tag) => (
                                    <div key={tag} className="mr-2 p-2 bg-blue-200 rounded-full">
                                        <div className="text-sm font-semibold">{tag}</div>
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

            const newEntries: [number, string][] = items.map((item: any) => {
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
    let songUri = '';

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
    let uris: string[] = [];
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
