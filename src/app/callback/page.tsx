'use client';
import { useEffect, useState } from 'react';
import { LoaderCircle } from "lucide-react";
import { SectionErrorState } from "@/components/async-states";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export default function CallbackPage() {
    const [error, setError] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) {
            setError(true);
            return;
        }

        const verifier = sessionStorage.getItem('code_verifier') || '';

        const body = new URLSearchParams();
        body.append('client_id', clientId!);
        body.append('grant_type', 'authorization_code');
        body.append('code', code);
        body.append('redirect_uri', redirectUri!);
        body.append('code_verifier', verifier);

        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error_description || "Spotify authorization failed.");
                return data;
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error_description || data.error);
                }
                sessionStorage.setItem('access_token', data.access_token);
                window.location.href = '/top-items';
            })
            .catch(() => {
                setError(true);
            });
    }, []);

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#AAD7B8] p-6">
            {error ? (
                <SectionErrorState
                    title="Spotify connection failed"
                    message="We couldn’t complete the Spotify connection. Return home and try connecting again."
                    onRetry={() => {
                        window.location.href = "/";
                    }}
                />
            ) : (
                <div role="status" className="flex items-center gap-3 border-2 border-black bg-[#fffbeb] p-6 font-bold shadow-[6px_6px_0_0_#000]">
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                    Connecting Spotify…
                </div>
            )}
        </main>
    );
}
