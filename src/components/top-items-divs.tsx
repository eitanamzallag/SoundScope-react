"use client";

import {
    createRecommendationPlaylist,
    isSpotifyAuthError,
    PreloadedItemsMap,
    TopItems as TopItemsList,
    UserProfile,
} from "../app/api/spotifyAPI";
import {usePopularity} from "../app/api/spotifyAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, useMotionValue, useTransform } from "motion/react";
import { animate } from "motion"
import { CheckCircle2, Download, ExternalLink, LoaderCircle } from "lucide-react";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { EmptyState, SectionErrorState, SpotifyAuthState, TopItemsSkeleton } from "@/components/async-states";

const musicTasteArchetypes = [
    ["The Phantom Listener 👻", "You’re basically an underground legend. Even Spotify doesn’t know your taste exists."],
    ["The Vault Keeper 🔒", "So obscure, your playlists could qualify as secret archives."],
    ["The Rebel Collector 🕶️", "You’re still off the mainstream radar — just the way you like it."],
    ["The Indie Oracle 🔮", "You’re a hidden gem hunter. A few people get it… and they’re cool too."],
    ["The Balanced Ear ⚖️", "Balanced taste — not too niche, not too basic. You walk the fine line of good music karma."],
    ["The Party Diplomat 🎉", "You’ve got crowd-pleaser vibes. Your songs could make any party playlist."],
    ["The Crowd Conductor 🕺", "Pretty popular! Your taste is out there doing numbers."],
    ["The Trend Whisperer 💃", "You’re trending! You and the algorithm are basically best friends."],
    ["The Hit Alchemist 🌟", "Certified hitmaker. You set the vibe, others just follow."],
    ["The Mainstream Monarch 👑", "You *are* the mainstream. The world dances to your soundtrack."]
];

export function Welcome() {
    return <div className="flex min-h-full w-full flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center sm:flex-row sm:flex-wrap sm:justify-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-8xl">Welcome, </h1>
            < UserProfile/>
        </div>
        <h4 className="scroll-m-20 max-w-xl text-lg font-semibold tracking-tight sm:text-2xl">Find out how popular your taste in music
            is</h4>
    </div>
}

interface PopularityAnimationProps {
    popularity: number;
    onComplete: () => void;
}

function PopularityAnimation({ popularity, onComplete }: PopularityAnimationProps) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, popularity, { duration: 5 });
        controls.then(() => {
            onComplete();
        });
        return () => controls.stop();
    }, [popularity, count]);

    return <motion.pre>{rounded}</motion.pre>;
}


export function Popularity() {
    const { popularityScore, artistPopularity, status, error, retry } = usePopularity(50);
    const [animationFinished, setAnimationFinished] = useState(false);
    const handleAnimationComplete = () => { setAnimationFinished(true); };

    if (status === "loading") return <TopItemsSkeleton count={2} />;
    if (status === "error") {
        return isSpotifyAuthError(error)
            ? <SpotifyAuthState />
            : <SectionErrorState title="We couldn’t calculate your popularity" message="Spotify didn’t respond. Please try again." onRetry={retry} />;
    }
    if (popularityScore === null || artistPopularity.length === 0) {
        return (
            <EmptyState
                title="Not enough listening history yet"
                message="Spotify needs more listening activity before SoundScope can calculate this score."
            />
        );
    }

    const leastPopular = artistPopularity!.slice(-5);
    const mostPopular = artistPopularity!.slice(0,5);
    let archetype: string;
    let description: string;
    if (popularityScore != 100) {
        [archetype, description] = musicTasteArchetypes[Math.floor(popularityScore! / 10)];
    }
    else {
        [archetype, description] = musicTasteArchetypes[musicTasteArchetypes!.length - 1];
    }

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
            <div className="mb-8 flex flex-wrap items-center justify-center text-center">
                <h4 className="scroll-m-20 text-2xl font-bold tracking-tight sm:text-3xl">Your popularity score is </h4>
                <h4 className="scroll-m-20 pl-2 text-2xl font-black tracking-tight sm:pl-4 sm:text-3xl">
                    {typeof popularityScore === 'number' ? (
                        <PopularityAnimation popularity={popularityScore} onComplete={handleAnimationComplete} />
                    ) : (<div></div>)}
                </h4>
            </div>

            {animationFinished && archetype && description && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full mb-10"
                >
                    <Card className="border-4 border-black bg-white text-center shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000]">
                        <CardHeader className="px-4 sm:px-6">
                            <CardTitle className="text-2xl font-black sm:text-3xl">{archetype}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6">
                            <p className="text-base font-medium italic sm:text-lg">{`"${description}"`}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {animationFinished && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="grid w-full grid-cols-1 gap-8 md:grid-cols-2"
                >
                    {/* most popular */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-widest bg-black text-white px-4 py-1 inline-block">
                            Hall of Fame
                        </h3>
                        {mostPopular.map(([popularity, name]) => (
                            <div key={name} className="flex justify-between items-center border-2 border-black p-3 bg-[#fdc6ff] shadow-[4px_4px_0_0_#000]">
                                <span className="font-mono font-bold">{name}</span>
                                <span className="text-xs font-black bg-white border-2 border-black px-2 py-0.5">{popularity}%</span>
                            </div>
                        ))}
                    </div>

                    {/* least popular */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-widest bg-black text-white px-4 py-1 inline-block">
                            The Underground
                        </h3>
                        {leastPopular.map(([popularity, name]) => (
                            <div key={name} className="flex justify-between items-center border-2 border-black p-3 bg-[#89b4fa] shadow-[4px_4px_0_0_#000]">
                                <span className="font-mono font-bold">{name}</span>
                                <span className="text-xs font-black bg-white border-2 border-black px-2 py-0.5">{popularity}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export function Recommendations() {
    type SeedOption = 'artists' | 'tracks' | 'surprise';
    const [activeSeed, setActiveSeed] = useState<SeedOption>('artists');
    const [playlistLength, setPlaylistLength] = useState<number>(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [playlistResult, setPlaylistResult] = useState<Awaited<ReturnType<typeof createRecommendationPlaylist>> | null>(null);
    const [authRequired, setAuthRequired] = useState(false);

    const seeds: { id: SeedOption; label: string }[] = [
        { id: 'artists', label: 'Top Artists' },
        { id: 'tracks', label: 'Top Tracks' },
        { id: 'surprise', label: 'Surprise Me' },
    ];
    const lengths = [10, 20, 30];

    const generatePlaylist = async () => {
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationError(null);
        setPlaylistResult(null);
        setAuthRequired(false);

        try {
            const result = await createRecommendationPlaylist(playlistLength, activeSeed);
            setPlaylistResult(result);
        } catch (error) {
            console.error("Failed to generate playlist:", error);
            if (isSpotifyAuthError(error)) {
                setAuthRequired(true);
            } else {
                setGenerationError("Could not generate the playlist. Please try again.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (authRequired) return <SpotifyAuthState />;

    return (
        <div className="flex w-full max-w-4xl flex-col">
            <h4 className="scroll-m-20 pb-8 text-xl font-semibold tracking-tight sm:pb-10 sm:text-3xl">Tired of the same 10 songs?
                Adjust the dials below to generate a playlist that actually gets your taste. </h4>
            <h4 className="scroll-m-20 text-sm font-semibold tracking-tight pb-4 text-center"> Generate recommendations based on your: </h4>
            <div className="mb-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                {seeds.map((seed) => (
                    <button
                        key={seed.id}
                        onClick={() => setActiveSeed(seed.id)}
                        disabled={isGenerating}
                        className={`
                            px-4 py-2 text-sm font-mono border-2 border-black transition-all disabled:cursor-wait disabled:opacity-60
                            ${activeSeed === seed.id
                            ? 'bg-[#fdc6ff] shadow-[4px_4px_0_0_#000] -translate-y-1'
                            : 'bg-white hover:bg-gray-50 active:translate-y-0'
                            }
                        `}
                    >
                        {seed.label}
                    </button>
                ))}
            </div>

            <div className="grid w-full grid-cols-1 gap-3 pb-10 min-[420px]:grid-cols-3">
                {lengths.map((len) => (
                    <button
                        key={len}
                        onClick={() => setPlaylistLength(len)}
                        disabled={isGenerating}
                        className={`
              px-6 py-2 text-sm font-mono border-2 border-black transition-all disabled:cursor-wait disabled:opacity-60
              ${playlistLength === len
                            ? 'bg-[#fdc6ff] shadow-[4px_4px_0_0_#000] -translate-y-1'
                            : 'bg-white hover:bg-gray-50 active:translate-y-0 shadow-none'
                        }
            `}
                    >
                        {len} Tracks
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={generatePlaylist}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-mono font-bold border-2 border-black bg-[#89b4fa] shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-wait disabled:opacity-70"
            >
                {isGenerating && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
                {isGenerating ? "Generating playlist..." : "Generate Playlist"}
            </button>

            {generationError && (
                <p role="alert" className="pt-4 text-center font-mono text-sm font-bold text-red-700">
                    {generationError}
                </p>
            )}

            {playlistResult && (
                <Card aria-live="polite" className="mt-6 border-2 border-black bg-[#caffbf] shadow-[6px_6px_0_0_#000]">
                    <CardHeader>
                        <CheckCircle2 aria-hidden="true" />
                        <CardTitle className="text-2xl font-black">Playlist created!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <p>
                            {playlistResult.added === playlistResult.requested
                                ? `${playlistResult.added} tracks were added to your new playlist.`
                                : `${playlistResult.added} of ${playlistResult.requested} recommendations were matched on Spotify.`}
                        </p>
                        <a
                            href={playlistResult.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 border-2 border-black bg-black px-4 py-2 font-bold uppercase text-white"
                        >
                            Open in Spotify
                            <ExternalLink size={16} aria-hidden="true" />
                        </a>
                    </CardContent>
                </Card>
            )}
            </div>
    )
}

export function TopItemsSection({ items, type }: { items: PreloadedItemsMap[], type: string }) {
    const serializedItemsShort = Array.from(items[0].entries()).map(([itemName, item]) => {
        return {
            name: itemName,
            imageUrl: item.imageUrl,
            tags: Array.from(item.tags),
            tagsUnavailable: item.tagsUnavailable,
        };
    });
    const serializedItemsMedium = Array.from(items[1].entries()).map(([itemName, item]) => {
        return {
            name: itemName,
            imageUrl: item.imageUrl,
            tags: Array.from(item.tags),
            tagsUnavailable: item.tagsUnavailable,
        };
    });
    const serializedItemsLong = Array.from(items[2].entries()).map(([itemName, item]) => {
        return {
            name: itemName,
            imageUrl: item.imageUrl,
            tags: Array.from(item.tags),
            tagsUnavailable: item.tagsUnavailable,
        };
    });
    return(
        <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center px-0 sm:px-4">

            <h1 className="scroll-m-20 w-full pb-6 text-center text-4xl font-extrabold tracking-tight sm:pb-10 sm:text-5xl md:whitespace-nowrap md:text-7xl lg:text-8xl">
                Your top {type}:
            </h1>

            <Tabs defaultValue="short" className="w-full">
                <TabsList className="mb-4 grid h-auto w-full grid-cols-3 gap-1 bg-transparent sm:gap-4">
                    <TabsTrigger value="short" className="border-2 border-black px-2 text-xs sm:text-sm">4 Weeks</TabsTrigger>
                    <TabsTrigger value="medium" className="border-2 border-black px-2 text-xs sm:text-sm">6 Months</TabsTrigger>
                    <TabsTrigger value="long" className="border-2 border-black px-2 text-xs sm:text-sm">1 Year</TabsTrigger>
                </TabsList>

                <TabsContent value="short" className="w-full">
                    <TopItemsList topItems={serializedItemsShort} />
                </TabsContent>
                <TabsContent value="medium" className="w-full">
                    <TopItemsList topItems={serializedItemsMedium} />
                </TabsContent>
                <TabsContent value="long" className="w-full">
                    <TopItemsList topItems={serializedItemsLong} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

interface SummaryProps {
    popularityScore: number;
    topArtist: string;
    topTrack: string;
    archetype: string;
    description: string;
}

export function MusicSummary({ popularityScore, topArtist, topTrack, archetype, description }: SummaryProps) {
    const summaryRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const saveAsImage = async () => {
        if (!summaryRef.current || isSaving) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            await document.fonts.ready;

            const dataUrl = await toPng(summaryRef.current, {
                backgroundColor: "#fffbeb",
                cacheBust: true,
                pixelRatio: 2,
                style: {
                    margin: "0",
                    transform: "none",
                },
            });

            const link = document.createElement("a");
            link.download = "soundscope-summary.png";
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to save summary as an image:", error);
            setSaveError("Could not save the image. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex w-full min-w-0 flex-col items-center gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div ref={summaryRef} className="w-full bg-[#fffbeb] pr-2 pb-2 sm:pr-3 sm:pb-3">
                    <div className="flex w-full flex-col items-center border-4 border-black bg-[#fffbeb] p-4 shadow-[7px_7px_0_0_#000] sm:p-8 sm:shadow-[12px_12px_0_0_#000]">
                        <div className="w-full border-b-4 border-black pb-4 mb-6 text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic sm:text-4xl">The Final Verdict</h2>
                            <p className="font-mono text-[10px] opacity-60 sm:text-sm">GENERATED BY SOUNDSCOPE v1.0</p>
                        </div>

                        <div className="mb-6 w-full border-2 border-black bg-[#caffbf] p-4 text-center shadow-[4px_4px_0_0_#000] sm:p-6">
                            <h3 className="mb-2 text-xl font-black sm:text-2xl">{archetype}</h3>
                            <p className="font-medium italic leading-tight">{`"${description}"`}</p>
                        </div>

                        <div className="mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="p-4 border-2 border-black bg-white">
                                <p className="text-[10px] font-black uppercase opacity-40">Mainstream Rating</p>
                                <p className="text-2xl font-black">{popularityScore}%</p>
                            </div>
                            <div className="p-4 border-2 border-black bg-white">
                                <p className="text-[10px] font-black uppercase opacity-40">Heavy Rotation</p>
                                <p className="truncate text-xl font-bold sm:text-2xl">{topArtist}</p>
                            </div>
                            <div className="p-4 border-2 border-black bg-white md:col-span-2">
                                <p className="text-[10px] font-black uppercase opacity-40">Current Anthem</p>
                                <p className="truncate text-xl font-bold sm:text-2xl">{topTrack}</p>
                            </div>
                        </div>

                        <div className="w-full flex justify-between items-center opacity-30 font-mono text-[10px]">
                            <span>NO. 8839-442</span>
                            <span>AUTHENTIC TASTE CERTIFIED</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <button
                type="button"
                onClick={saveAsImage}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 border-2 border-black bg-[#fdc6ff] px-6 py-3 font-mono font-bold uppercase shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
                <Download size={18} aria-hidden="true" />
                {isSaving ? "Saving..." : "Save as image"}
            </button>

            {saveError && (
                <p role="alert" className="font-mono text-sm font-bold text-red-700">
                    {saveError}
                </p>
            )}
        </div>
    );
}

export function Summary({ items }: { items: PreloadedItemsMap[]; }) {
    const { popularityScore, artistPopularity, status, error, retry } = usePopularity(50);

    if (status === "loading") return <TopItemsSkeleton count={2} />;
    if (status === "error") {
        return isSpotifyAuthError(error)
            ? <SpotifyAuthState />
            : <SectionErrorState title="We couldn’t build your summary" message="Spotify didn’t respond. Please try again." onRetry={retry} />;
    }
    if (popularityScore === null || artistPopularity.length === 0 || items[0].size === 0) {
        return (
            <EmptyState
                title="Not enough listening history yet"
                message="Keep listening on Spotify and return when there is enough activity to build your summary."
            />
        );
    }

    const topArtist = artistPopularity[0][1];
    const topTrack = Array.from(items[0].keys())[0];
    const archetypeIndex = Math.min(musicTasteArchetypes.length - 1, Math.floor(popularityScore / 10));
    const [archetype, description] = musicTasteArchetypes[archetypeIndex];

    return (
        <div className="flex w-full min-w-0 flex-col">
            <MusicSummary popularityScore={popularityScore} topArtist={topArtist} topTrack={topTrack} archetype={archetype} description={description} />
        </div>
    );
}
