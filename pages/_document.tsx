// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="fr">
            <Head>
                {/* Manifest */}
                <link rel="manifest" href="/manifest.json" />

                {/* Icônes */}
                <link rel="icon" href="/favicon_spotIn.svg" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />

                {/* Métadonnées PWA */}
                <meta name="theme-color" content="#8B5CF6" />
                <meta name="background-color" content="#242424" />

                {/* Mobile */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-status-bar-style" content="black-translucent" />

                {/* Apple */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="SpotIn" />

                {/* Microsoft */}
                <meta name="msapplication-TileColor" content="#8B5CF6" />
                <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
                <meta name="msapplication-config" content="/browserconfig.xml" />

                {/* Préchargement des ressources critiques */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

                {/* SEO et partage */}
                <meta name="description" content="Découvrez les meilleurs spots musicaux de Paris avec SpotIn" />
                <meta name="keywords" content="musique, Paris, événements, concerts, spots, sorties" />
                <meta name="author" content="SpotIn" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="SpotIn" />
                <meta property="og:title" content="SpotIn - Spots musicaux de Paris" />
                <meta property="og:description" content="Découvrez les meilleurs spots musicaux de Paris" />
                <meta property="og:image" content="/logo_spottin.webp" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="SpotIn - Spots musicaux de Paris" />
                <meta name="twitter:description" content="Découvrez les meilleurs spots musicaux de Paris" />
                <meta name="twitter:image" content="/logo_spottin.webp" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}