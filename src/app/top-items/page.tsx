"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/ui/Footer";
import { Welcome, Popularity, Recommendations, TopArtists, TopTracks } from "@/components/top-items-divs";
import { Button } from "@/components/ui/button";
import { PreloadItems } from "@/lib/spotifyAPI";
import {ChartLineIcon, Disc3Icon, HeadphonesIcon, HomeIcon, MicVocalIcon, ScrollTextIcon, UserIcon} from "lucide-react";
import LightIcon from "next/dist/next-devtools/dev-overlay/icons/light-icon";
export default function topItems() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [topArtists, setTopArtists] = useState<Map<string, [string, Set<string>]> | undefined>(undefined);
    const [topTracks, setTopTracks] = useState<Map<string, [string, Set<string>]> | undefined>(undefined);

    const texts = [
        [<UserIcon />, "Profile"],
        [<ChartLineIcon />, "Popularity"],
        [<HeadphonesIcon />, "Recommendations"],
        [<MicVocalIcon/>, "Top Artists"],
        [<Disc3Icon/>, "Top Songs"],
        [<ScrollTextIcon/>, "Summary"],
    ]

    useEffect(() => {

        console.log("App has loaded. Starting preload...");
        const artists = PreloadItems({ type: "artists" });
        const tracks = PreloadItems({ type: "tracks" });
        setTopArtists(artists);
        setTopTracks(tracks);
    }, []);

    const divs = [
        <Welcome />,
        <Popularity />,
        <Recommendations />,
        <TopArtists artists={topArtists!}/>,
        <TopTracks tracks={topTracks!} />,
        // add top songs and summary pages
    ]

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
      </div>
    );
}