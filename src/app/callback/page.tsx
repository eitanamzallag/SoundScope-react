'use client';
import { useEffect } from 'react';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export default function CallbackPage() {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) return;

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
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error("Spotify error:", data.error, data.error_description);
                    return;
                }
                sessionStorage.setItem('access_token', data.access_token);
                window.location.href = '/top-items';
            })
    }, []);

    return null;
}
