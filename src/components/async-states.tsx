"use client";

import { AlertTriangle, Music, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopItemsSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div role="status" aria-label="Loading music data" className="w-full max-w-4xl space-y-4">
            <div className="mx-auto mb-8 h-12 w-2/3 animate-pulse bg-black/10 motion-reduce:animate-none sm:h-20" />
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <div className="h-5 w-7 animate-pulse bg-black/10 motion-reduce:animate-none" />
                    <div className="flex flex-1 items-center gap-4 border-2 border-black bg-[#fdc6ff] p-3">
                        <div className="h-14 w-14 shrink-0 animate-pulse bg-black/15 motion-reduce:animate-none sm:h-20 sm:w-20" />
                        <div className="h-5 w-1/2 animate-pulse bg-black/15 motion-reduce:animate-none" />
                    </div>
                </div>
            ))}
            <span className="sr-only">Analyzing your listening history…</span>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div role="status" aria-label="Loading Spotify profile" className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-12 w-48 animate-pulse bg-black/10 motion-reduce:animate-none sm:h-20 sm:w-72" />
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-black/10 motion-reduce:animate-none sm:h-[150px] sm:w-[150px]" />
        </div>
    );
}

export function SectionErrorState({
    title,
    message,
    onRetry,
}: {
    title: string;
    message: string;
    onRetry?: () => void;
}) {
    return (
        <Card className="w-full max-w-xl border-2 border-black bg-[#fdc6ff] shadow-[6px_6px_0_0_#000]">
            <CardHeader>
                <AlertTriangle aria-hidden="true" />
                <CardTitle className="text-2xl font-black">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <p>{message}</p>
                {onRetry && (
                    <Button
                        type="button"
                        onClick={onRetry}
                        className="border-2 border-black bg-white text-black shadow-[3px_3px_0_0_#000] hover:bg-white"
                    >
                        <RefreshCw aria-hidden="true" />
                        Try again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
    return (
        <Card className="w-full max-w-xl border-2 border-black bg-[#caffbf] text-center shadow-[6px_6px_0_0_#000]">
            <CardHeader className="items-center">
                <Music aria-hidden="true" />
                <CardTitle className="text-2xl font-black">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{message}</p>
            </CardContent>
        </Card>
    );
}

export function SpotifyAuthState() {
    return (
        <Card className="w-full max-w-xl border-2 border-black bg-[#fdc6ff] text-center shadow-[6px_6px_0_0_#000]">
            <CardHeader>
                <CardTitle className="text-2xl font-black">Your Spotify session expired</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <p>Reconnect Spotify to continue exploring your listening history.</p>
                <Button
                    type="button"
                    onClick={() => {
                        sessionStorage.removeItem("access_token");
                        window.location.href = "/";
                    }}
                    className="border-2 border-black bg-[#caffbf] text-black shadow-[3px_3px_0_0_#000] hover:bg-[#caffbf]"
                >
                    Reconnect Spotify
                </Button>
            </CardContent>
        </Card>
    );
}
