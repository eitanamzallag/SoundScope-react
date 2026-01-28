"use client";

import {createRecommendationPlaylist, TopItems as TopItemsList, UserProfile} from "../lib/spotifyAPI";
import {usePopularity} from "../lib/spotifyAPI";
import {Button} from "@/components/ui/button";
import {getTopTags} from "../lib/lastfmAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, useMotionValue, useTransform } from "motion/react";
import { animate } from "motion"
import { useEffect, useState } from "react";


export function Welcome() {
    return <div className="flex flex-col justify-center items-center">
        <div className="flex flex-row flex-wrap items-center">
            <h1 className="scroll-m-20 text-8xl font-extrabold tracking-tight text-balance">Welcome, </h1>
            < UserProfile/>
        </div>
        <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">Find out how popular your taste in music
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
    const popularityScore = usePopularity(50);
    let archetype: string;
    let description: string;
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
    if (popularityScore != 100) {
        [archetype, description] = musicTasteArchetypes[Math.floor(popularityScore! / 10)];
    }
    else {
        [archetype, description] = musicTasteArchetypes[musicTasteArchetypes!.length - 1];
    }

    const [animationFinished, setAnimationFinished] = useState(false);
    const handleAnimationComplete = () => { setAnimationFinished(true); };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row items-center mb-5">
                <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">Your popularity score is </h4>
                <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight pl-4">
                    {typeof popularityScore === 'number' ? (
                        <PopularityAnimation popularity={ popularityScore }
                                             onComplete={ handleAnimationComplete } />
                    ) : (<div></div>)}
                </h4>


            </div>

            {animationFinished && archetype && description && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: 0.5,
                        ease: [0, 0.71, 0.2, 1.01],
                    }}
                >
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle>{archetype}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">{description}</p>
                        </CardContent>
                    </Card>
                </motion.div>

            )}
        </div>
    )
}

export function Recommendations() {
    // TODO: add loading animation for playlist saving
    return (
        <div className="flex flex-col justify-center">
            <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">A playlist with (very good) recommendations specially made for you is waiting right here... Dare to save it?</h4>
            <Button onClick={() => createRecommendationPlaylist(20)} variant="default">Save Playlist</Button>
            <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">Your top tags:</h4>
            <Button onClick={() => getTopTags(10)} variant="default">Get tags</Button>
        </div>
    )
}

export function TopItems({ items, type }: { items: (Map<string, [string, Set<string>]> | undefined)[], type: string }) {
    const serializedItemsShort = Array.from(items[0]!.entries()).map(([itemName, [imageUrl, tagsSet]]) => {
        return {
            name: itemName,
            imageUrl: imageUrl,
            tags: Array.from(tagsSet) // Converts Set<string> -> string[]
        };
    });
    const serializedItemsMedium = Array.from(items[1]!.entries()).map(([itemName, [imageUrl, tagsSet]]) => {
        return {
            name: itemName,
            imageUrl: imageUrl,
            tags: Array.from(tagsSet) // Converts Set<string> -> string[]
        };
    });
    const serializedItemsLong = Array.from(items[2]!.entries()).map(([itemName, [imageUrl, tagsSet]]) => {
        return {
            name: itemName,
            imageUrl: imageUrl,
            tags: Array.from(tagsSet) // Converts Set<string> -> string[]
        };
    });
    return(
        <div className="flex flex-col justify-start">
            <h1 className="scroll-m-20 text-8xl font-extrabold tracking-tight text-balance pb-5">Your top {type}: </h1>

            <Tabs defaultValue="short">
                <TabsList>
                    <TabsTrigger value="short">4 Weeks</TabsTrigger>
                    <TabsTrigger value="medium">6 Months</TabsTrigger>
                    <TabsTrigger value="long">1 Year</TabsTrigger>
                </TabsList>
                <TabsContent value="short"><TopItemsList topItems={serializedItemsShort} /></TabsContent>
                <TabsContent value="medium"><TopItemsList topItems={serializedItemsMedium} /></TabsContent>
                <TabsContent value="long"><TopItemsList topItems={serializedItemsLong} /></TabsContent>
            </Tabs>
        </div>
    )
}