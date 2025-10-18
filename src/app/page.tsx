'use client';
import { Button } from "@/components/ui/button"
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
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
      <div className="flex flex-col justify-between min-h-screen text-black">
          <Header />
          <main className="flex flex-col items-start p-5">
              <h1 className="scroll-m-20 text-8xl font-extrabold tracking-tight text-balance">TURN YOUR LISTENING HABITS INTO A STORY WORTH SHARING</h1>
              <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight pt-2"> Connect your Spotify account to reveal personalized insights about your top artists, favorite songs, and listening habits.</h4>
              <div className="pt-3">
                  <Button onClick={login} variant="default">Log in with Spotify</Button>
              </div>
          </main>
          <Footer />
      </div>
    );
}
