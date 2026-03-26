import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only — configures the root HTML for every page during
// static rendering (expo export --platform web).
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <title>Kaninens Cykelfest 2026</title>

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme & status bar */}
        <meta name="theme-color" content="#1C4F4A" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS Safari PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cykelfest" />
        <link rel="apple-touch-icon" href="/icon-512.png" />

        {/* Prevent address bar theming on Android */}
        <meta name="msapplication-TileColor" content="#1C4F4A" />

        {/* Disable body scrolling — makes ScrollView work like native */}
        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
html, body { height: 100%; margin: 0; padding: 0; background-color: #111; }
body { overflow: hidden; display: flex; justify-content: center; align-items: stretch; }
#root { display: flex; height: 100%; flex: 1; max-width: 430px; width: 100%; margin: 0 auto; overflow: hidden; background-color: #1c4f4a; box-shadow: 0 0 60px rgba(0,0,0,0.5); }
`,
          }}
        />
      </head>
      <body>
        {children}

        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (reg) { console.log('[PWA] SW registered:', reg.scope); })
      .catch(function (err) { console.log('[PWA] SW failed:', err); });
  });
}
`,
          }}
        />
      </body>
    </html>
  );
}
