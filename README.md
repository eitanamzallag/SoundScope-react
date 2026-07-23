# SoundScope

SoundScope turns Spotify listening history into an interactive profile of a listener’s music taste. It combines Spotify’s personal listening data with Last.fm’s community-generated metadata to surface popularity insights, listening patterns, top artists and tracks, and personalized playlist recommendations.

The project was built as a portfolio piece focused on third-party API integration, resilient frontend state management, and responsive product design.

[Website Demo](https://sound-scope-react.vercel.app/)

## Features

- Spotify authorization using the PKCE flow
- Personalized popularity score and music-taste archetype
- Most mainstream and most underground artists
- Top artists and tracks across four-week, six-month, and one-year ranges
- Last.fm tags for additional genre and style context
- Personalized Spotify playlist generation from artists, tracks, or a surprise seed
- Direct link to each successfully created Spotify playlist
- Downloadable PNG summary card
- Responsive phone, tablet, and desktop layouts
- Loading skeletons, empty states, retry controls, and expired-session recovery
- Partial rendering when optional Last.fm metadata is unavailable


## Responsive design

The interface uses a viewport-height application shell with an independently scrollable content panel, keeping navigation and the footer available.

- Phones and tablets use horizontally scrollable section navigation.
- Larger screens switch to a vertical sidebar.
- Cards, grids, controls, typography, images, and shadows scale across breakpoints.
- Long track and artist names are constrained without creating page-level overflow.
- Floating information panels are limited by the current viewport.

## Technology

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Motion](https://motion.dev/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Last.fm API](https://www.last.fm/api)
- [`html-to-image`](https://github.com/bubkoo/html-to-image)
- [Vercel](https://vercel.com/)


## Author

Built by [Eitan Amzallag](https://www.linkedin.com/in/eitan-amzallag/).
