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

    const navigationItems = [
        { icon: <UserIcon />, label: "Profile" },
        { icon: <ChartLineIcon />, label: "Popularity" },
        { icon: <HeadphonesIcon />, label: "Recommendations" },
        { icon: <MicVocalIcon />, label: "Top Artists" },
        { icon: <Disc3Icon />, label: "Top Songs" },
        { icon: <ScrollTextIcon />, label: "Summary" },
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
        <div className="flex min-h-dvh flex-col overflow-hidden text-black"
             style={{
                 backgroundColor: "#AAD7B8",
                 backgroundRepeat: 'no-repeat',
                 backgroundSize: 'cover',
             }}>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3 lg:flex-row lg:pt-7">
                <nav
                    aria-label="SoundScope sections"
                    className="flex w-full shrink-0 gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-56 lg:flex-col lg:gap-0 lg:overflow-visible lg:p-4 xl:w-1/6 xl:p-5"
                >
                    {navigationItems.map(({ icon, label }, index) => (
                        <Button
                            key={label}
                            variant="ghost"
                            aria-current={activeIndex === index ? "page" : undefined}
                            className={`h-auto min-w-[5.25rem] flex-col gap-1 rounded-md px-3 py-2 text-[10px] lg:min-w-0 lg:flex-row lg:justify-start lg:gap-2 lg:p-4 lg:text-sm xl:p-8 ${
                                activeIndex === index ? "bg-white/70 shadow-[3px_3px_0_0_#000]" : ""
                            }`}
                            onClick={() => nextDiv(index)}
                        >
                            {React.cloneElement(icon, { className: "size-4 shrink-0" })} <span>{label}</span>
                        </Button>
                    ))}
                </nav>
                <main className="mx-3 mb-3 flex min-h-0 flex-1 justify-center overflow-y-auto overflow-x-hidden border-2 border-black bg-[#FFFFE4] shadow-[4px_4px_0_0_#000] lg:m-4 lg:ml-6 lg:mr-8"
                     style={{
                         backgroundColor: "#FFF7E4",
                         backgroundRepeat: 'no-repeat',
                         backgroundSize: 'cover',
                     }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            className="flex w-full min-w-0 justify-center p-4 sm:p-6"
                            initial={{ opacity: 0, y: 80 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -80 }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                        >
                            {divs[activeIndex]}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            <Footer />
            <ProjectInfo />
      </div>
    );
}
