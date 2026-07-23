"use client";

import { SectionErrorState } from "@/components/async-states";

export default function TopItemsError({ reset }: { error: Error; reset: () => void }) {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#AAD7B8] p-6">
            <SectionErrorState
                title="SoundScope hit an unexpected error"
                message="Your data is safe. Try loading this section again."
                onRetry={reset}
            />
        </main>
    );
}
