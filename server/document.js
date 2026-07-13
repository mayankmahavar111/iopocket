import React from "react"
import { Head, Body } from "catalyst-core"

function Document(props) {
    return (
        <html lang="en">
            <Head {...props}>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
                <meta name="theme-color" content="#0f172a" />
                <link rel="manifest" href="/manifest.json" />
                
                {/* Google Fonts - Inter and Outfit */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

                {/* Inline script to prevent FOUC (Flash of Unstyled Theme) */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                const theme = localStorage.getItem('theme');
                                if (theme === 'dark') {
                                    document.documentElement.classList.add('dark');
                                } else if (theme === 'light') {
                                    document.documentElement.classList.remove('dark');
                                } else {
                                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    if (prefersDark) {
                                        document.documentElement.classList.add('dark');
                                    }
                                }
                            } catch (e) {}
                        })();
                    `
                }} />
            </Head>
            <Body {...props} />
        </html>
    )
}
export default Document
