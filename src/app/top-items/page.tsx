"use client"
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/ui/Footer";
import { Welcome, Popularity, Recommendations, TopItemsSection, Summary } from "@/components/top-items-divs";
import { Button } from "@/components/ui/button";
import { isSpotifyAuthError, PreloadedItemsMap, PreloadItems } from "@/app/api/spotifyAPI";
import {ChartLineIcon, Disc3Icon, HeadphonesIcon, MicVocalIcon, ScrollTextIcon, UserIcon} from "lucide-react";
import { ProjectInfo } from "@/components/project-info";
import { SectionErrorState, SpotifyAuthState, TopItemsSkeleton } from "@/components/async-states";

type SectionState<T> =
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error" };

export default function TopItems() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [topArtists, setTopArtists] = useState<SectionState<PreloadedItemsMap[]>>({ status: "loading" });
    const [topTracks, setTopTracks] = useState<SectionState<PreloadedItemsMap[]>>({ status: "loading" });
    const [authRequired, setAuthRequired] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const contentPanelRef = useRef<HTMLElement>(null);

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
            setTopArtists({ status: "loading" });
            setTopTracks({ status: "loading" });
            setAuthRequired(false);

            const artistsRequest = Promise.all([
                    PreloadItems({type: "artists", timeRange: "short_term"}),
                    PreloadItems({ type: "artists", timeRange: "medium_term" }),
                    PreloadItems({ type: "artists", timeRange: "long_term" })
            ]);
            const tracksRequest = Promise.all([
                    PreloadItems({ type: "tracks", timeRange: "short_term" }),
                    PreloadItems({ type: "tracks", timeRange: "medium_term" }),
                    PreloadItems({ type: "tracks", timeRange: "long_term" })
            ]);

            const [artistsResult, tracksResult] = await Promise.allSettled([artistsRequest, tracksRequest]);

            if (artistsResult.status === "fulfilled") {
                setTopArtists({ status: "success", data: artistsResult.value });
            } else {
                if (isSpotifyAuthError(artistsResult.reason)) {
                    setAuthRequired(true);
                }
                setTopArtists({ status: "error" });
            }

            if (tracksResult.status === "fulfilled") {
                setTopTracks({ status: "success", data: tracksResult.value });
            } else {
                if (isSpotifyAuthError(tracksResult.reason)) {
                    setAuthRequired(true);
                }
                setTopTracks({ status: "error" });
            }
        }

        loadAllSpotifyData();
    }, [reloadKey]);

    const retryPreload = () => setReloadKey(current => current + 1);
    const loadingState = <TopItemsSkeleton />;
    const artistsState = topArtists.status === "success"
        ? <TopItemsSection items={topArtists.data} type="artists" />
        : topArtists.status === "error"
            ? <SectionErrorState title="We couldn’t load your top artists" message="Spotify didn’t respond. Your other sections may still be available." onRetry={retryPreload} />
            : loadingState;
    const tracksState = topTracks.status === "success"
        ? <TopItemsSection items={topTracks.data} type="tracks" />
        : topTracks.status === "error"
            ? <SectionErrorState title="We couldn’t load your top tracks" message="Spotify didn’t respond. Your other sections may still be available." onRetry={retryPreload} />
            : loadingState;
    const summaryState = topTracks.status === "success"
        ? <Summary items={topTracks.data} />
        : topTracks.status === "error"
            ? <SectionErrorState title="We couldn’t build your summary" message="Your top tracks are unavailable right now." onRetry={retryPreload} />
            : loadingState;

    const divs: React.ReactNode[] = authRequired ? Array(6).fill(<SpotifyAuthState />) : [
        <Welcome key="welcome" />,
        <Popularity key="pop" />,
        <Recommendations key="rec" />,
        artistsState,
        tracksState,
        summaryState,
    ];

    const nextDiv = (index: number) => {
        setActiveIndex(index);
    };

    useEffect(() => {
        contentPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, [activeIndex]);

    return (
        <div className="flex h-dvh flex-col overflow-hidden text-black"
             style={{
                 backgroundColor: "#AAD7B8",
                 backgroundRepeat: 'no-repeat',
                 backgroundSize: 'cover',
             }}>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3 lg:flex-row lg:pt-7">
                <nav
                    aria-label="SoundScope sections"
                    className="flex w-full shrink-0 gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-56 lg:flex-col lg:gap-2 lg:overflow-visible lg:p-4 xl:w-1/6 xl:p-5"
                >
                    {navigationItems.map(({ icon, label }, index) => (
                        <Button
                            key={label}
                            variant="ghost"
                            aria-current={activeIndex === index ? "page" : undefined}
                            className={`h-auto min-w-[5.25rem] flex-col gap-1 rounded-md px-3 py-2 text-[10px] lg:min-w-0 lg:flex-row lg:justify-start lg:gap-2 lg:px-4 lg:py-3 lg:text-sm xl:px-6 xl:py-4 ${
                                activeIndex === index ? "bg-white/70 shadow-[2px_2px_0_0_#000]" : "hover:bg-white/40"
                            }`}
                            onClick={() => nextDiv(index)}
                        >
                            {React.cloneElement(icon, { className: "size-4 shrink-0" })} <span>{label}</span>
                        </Button>
                    ))}
                </nav>
                <main
                     ref={contentPanelRef}
                     className="mx-3 mb-3 flex min-h-0 flex-1 justify-center overflow-y-auto overflow-x-hidden border-2 border-black bg-[#FFFFE4] shadow-[4px_4px_0_0_#000] lg:m-4 lg:ml-6 lg:mr-8"
                     style={{
                         backgroundColor: "#FFF7E4",
                         backgroundRepeat: 'no-repeat',
                         backgroundSize: 'cover',
                     }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            className="flex w-full min-w-0 items-start justify-center p-4 sm:p-6"
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
