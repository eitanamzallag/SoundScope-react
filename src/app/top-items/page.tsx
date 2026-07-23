"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/ui/Footer";
import { Welcome, Popularity, Recommendations, TopItemsSection, Summary } from "@/components/top-items-divs";
import { Button } from "@/components/ui/button";
import { PreloadItems } from "@/app/api/spotifyAPI";
import {ChartLineIcon, Disc3Icon, HeadphonesIcon, MicVocalIcon, ScrollTextIcon, UserIcon} from "lucide-react";
import { ProjectInfo } from "@/components/project-info";
export default function TopItems() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [topArtists, setTopArtists] = useState<(Map<string, [string, Set<string>]> | undefined)[]>();
    const [topTracks, setTopTracks] = useState<(Map<string, [string, Set<string>]> | undefined)[]>();

    const texts: React.ReactNode[][] = [
        [<UserIcon key="profile" />, "Profile"],
        [<ChartLineIcon key="pop" />, "Popularity"],
        [<HeadphonesIcon key="rec" />, "Recommendations"],
        [<MicVocalIcon key="artists" />, "Top Artists"],
        [<Disc3Icon key="songs" />, "Top Songs"],
        [<ScrollTextIcon key="sum" />, "Summary"],
    ];

    useEffect(() => {
        async function loadAllSpotifyData() {
            console.log("starting preload");

            try {
                // define data requests as promises
                const artistPromises = [
                    PreloadItems({type: "artists", timeRange: "short_term"}),
                    PreloadItems({ type: "artists", timeRange: "medium_term" }),
                    PreloadItems({ type: "artists", timeRange: "long_term" })
                ];

                const trackPromises = [
                    PreloadItems({ type: "tracks", timeRange: "short_term" }),
                    PreloadItems({ type: "tracks", timeRange: "medium_term" }),
                    PreloadItems({ type: "tracks", timeRange: "long_term" })
                ];

                // wait for all 6 Maps to be fully populated
                const [artists, tracks] = await Promise.all([
                    Promise.all(artistPromises),
                    Promise.all(trackPromises)
                ]);

                setTopArtists(artists);
                setTopTracks(tracks);
            } catch (error) {
                console.error("Failed to preload items:", error);
            }
        }

        loadAllSpotifyData();
    }, []);

    const divs: React.ReactNode[] = [
        <Welcome key="welcome" />,
        <Popularity key="pop" />,
        <Recommendations key="rec" />,
        topArtists ? <TopItemsSection items={topArtists} type="artists" /> : <div>Loading Artists...</div>,
        topTracks ? <TopItemsSection items={topTracks} type="tracks" /> : <div>Loading Tracks...</div>,
        topTracks ? <Summary items={topTracks} /> : <div>Loading Summary...</div>,
    ];

    const nextDiv = (index: number) => {
        setActiveIndex(() => (index));
    };



    return (
        <div className="flex flex-col h-screen text-black overflow-hidden"
             style={{
                 backgroundColor: "#AAD7B8",
                 backgroundRepeat: 'no-repeat',
                 backgroundSize: 'cover',
             }}>
            <div className="flex flex-1 flex-row pt-7 overflow-hidden">
                <div className="flex flex-col p-5 w-1/6">
                    {texts.map(([icon, text], index) => (
                        <Button key={index} variant="ghost" className="p-8 w-full" onClick={() => nextDiv(index)}>
                            {icon} {text}
                        </Button>
                        ))}
                </div>
                <div className="flex bg-[#FFFFE4] w-5/6 ml-8 mr-8 border-2 border-black shadow-[4px_4px_0_0_#000] m-4 justify-center overflow-y-auto"
                     style={{
                         backgroundColor: "#FFF7E4",
                         backgroundRepeat: 'no-repeat',
                         backgroundSize: 'cover',
                     }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            className={"p-6 flex"}
                            initial={{ opacity: 0, y: 200 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -200 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            {divs[activeIndex]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
            <ProjectInfo />
      </div>
    );
}
