"use client";

import { useEffect, useState } from "react";
import { Github, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectInfo() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isOpen]);

    return (
        <aside className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <Card
                    id="project-information"
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="project-information-title"
                    className="w-[min(22rem,calc(100vw-3rem))] border-2 border-black bg-[#fffbeb] shadow-[8px_8px_0_0_#000]"
                >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b-2 border-black">
                        <div>
                            <p className="font-mono text-[10px] font-black uppercase opacity-50">
                                About this project
                            </p>
                            <CardTitle
                                id="project-information-title"
                                className="text-2xl font-black uppercase tracking-tight"
                            >
                                SoundScope
                            </CardTitle>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close project information"
                            className="shrink-0 border-2 border-black bg-white hover:bg-[#fdc6ff]"
                        >
                            <X aria-hidden="true" />
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6 font-mono text-sm">
                        <p>
                            SoundScope turns your Spotify listening history into a visual profile of your music taste,
                            complete with popularity insights, Last.fm tags, and personalized playlists.
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase">
                            <span className="border-2 border-black bg-[#fdc6ff] px-2 py-1 text-center">Spotify API</span>
                            <span className="border-2 border-black bg-[#caffbf] px-2 py-1 text-center">Last.fm API</span>
                            <span className="border-2 border-black bg-[#89b4fa] px-2 py-1 text-center">Next.js</span>
                            <span className="border-2 border-black bg-white px-2 py-1 text-center">TypeScript</span>
                        </div>

                        <p className="border-l-4 border-black pl-3 text-xs opacity-70">
                            Your listening data is used to generate this experience and is not permanently stored by
                            SoundScope.
                        </p>

                        <a
                            href="https://github.com/eitanamzallag/SoundScope-react"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 border-2 border-black bg-black px-4 py-2 font-bold uppercase text-white transition-transform hover:-translate-y-0.5"
                        >
                            <Github size={16} aria-hidden="true" />
                            View source
                        </a>
                    </CardContent>
                </Card>
            )}

            <Button
                type="button"
                size="icon"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? "Close project information" : "Open project information"}
                aria-expanded={isOpen}
                aria-controls="project-information"
                className="h-12 w-12 rounded-full border-2 border-black bg-[#fdc6ff] text-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-[#fdc6ff] hover:shadow-none"
            >
                <Info size={22} aria-hidden="true" />
            </Button>
        </aside>
    );
}
