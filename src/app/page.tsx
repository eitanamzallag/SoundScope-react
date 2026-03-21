'use client';
import React from 'react';
import { motion } from 'motion/react';
import { Music, Zap, Fingerprint } from 'lucide-react';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth';

export default function Home() {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    const scope = "user-top-read, user-read-private, user-read-currently-playing, user-modify-playback-state, user-read-playback-state playlist-modify-public playlist-modify-private"

    const login = async () => {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);
        sessionStorage.setItem('code_verifier', verifier);

        const authUrl = new URL("https://accounts.spotify.com/authorize");
        authUrl.searchParams.append("client_id", clientId!);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("redirect_uri", redirectUri!);
        authUrl.searchParams.append("scope", scope);
        authUrl.searchParams.append("code_challenge_method", "S256");
        authUrl.searchParams.append("code_challenge", challenge);

        window.location.href = authUrl.toString();
    };

    return (
        <div className="min-h-screen w-full bg-[#fffbeb] flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden font-black text-[15rem] leading-none uppercase">
                Data Data Data Data Data Data Data Data Data
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">

                <div className="flex gap-4 mb-8">
                    <div className="px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-tighter -rotate-2">
                        System v1.0
                    </div>
                    <div className="px-3 py-1 border-2 border-black text-black text-xs font-black uppercase tracking-tighter rotate-3">
                        Status: Ready to Analyze
                    </div>
                </div>

                <div className="relative mb-12">
                    <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.8] text-center italic">
                        Sound<br/>Scope
                    </h1>

                    <motion.div
                        initial={{ rotate: 10, scale: 0 }}
                        animate={{ rotate: -5, scale: 1 }}
                        className="absolute -top-6 -right-10 bg-[#fdc6ff] border-2 border-black p-4 shadow-[3px_3px_0_0_#000] hidden md:block"
                    >
                        <p className="font-black text-sm uppercase">Your taste, <br/>decoded.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-2xl text-center font-bold">
                    <div className="flex flex-col items-center">
                        <Fingerprint size={32} className="mb-2" />
                        <p className="text-xs uppercase">Archetype Analysis</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Zap size={32} className="mb-2" />
                        <p className="text-xs uppercase">Popularity Score</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Music size={32} className="mb-2" />
                        <p className="text-xs uppercase">Smart Playlists</p>
                    </div>
                </div>

                <button
                    onClick={login}
                    className="
                        group relative px-12 py-6
                        bg-[#caffbf] border-4 border-black
                        text-2xl font-black uppercase tracking-tighter
                        shadow-[10px_10px_0_0_#000]
                        hover:translate-x-1 hover:translate-y-1 hover:shadow-none
                        transition-all duration-200
                        flex items-center gap-4
                    "
                >
                    Connect Spotify
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={16} className="text-[#caffbf] fill-current" />
                    </div>
                </button>

                {/* Footer Disclaimer */}
                <p className="mt-12 font-mono text-[10px] uppercase opacity-40 max-w-xs text-center leading-tight">
                    By connecting, you authorize SoundScope to analyze your archives for research and entertainment purposes. No data is stored permanently.
                </p>
            </div>
        </div>
    );
}
