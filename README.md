# Kaninens Cykelfest 2026

Event app for Kaninens Cykelfest — a cycling party in Sunnersta, Uppsala on **May 30, 2026**.

Theme: **"Semesterresor vi minns"** (Memorable vacation trips)

---

## Projects

| Directory | Description | Port |
|-----------|-------------|------|
| `mobile/` | Expo React Native app | 8081 |
| `backend/` | Hono API server with Prisma (SQLite) | 3000 |

---

## Mobile App

Built with Expo SDK 53, React Native 0.76.7, NativeWind, and React Query.

### Tabs

| Tab | Route | Description |
|-----|-------|-------------|
| Hem | `(tabs)/index.tsx` | Home screen — countdown, Kaninen video messages, event timeline, news feed, team card, polls |
| Schema | `(tabs)/schema.tsx` | Day program with 6 stops (15:30–22:00), locked until event day |
| Ledtråd | `(tabs)/ledtrad.tsx` | Activity clues, locked until host activates |
| Poäng | `(tabs)/poang.tsx` | Live leaderboard for 10 teams, locked until Activity 1 starts |
| SOS | `(tabs)/sos.tsx` | Emergency info screen, always accessible |

### Special Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Värdläge | `host.tsx` | Host login, guest list, arrival/departure tracking per stop |
| Arrangörspanel | `admin.tsx` | Admin panel — phase activation, news publishing, emergency broadcast |

### Design

| Token | Value |
|-------|-------|
| Teal (primary) | `#1C4F4A` |
| Cream (background) | `#F5EFE0` |
| Orange (accent) | `#C4814A` |
| Teal light | `#A8D4B8` |
| Heading font | DM Serif Display |
| Body font | DM Sans |
| Mono font | Space Mono |

---

## Teams (10 total)

| Team | Emoji | Destination theme |
|------|-------|-------------------|
| Charter | 🏖️ | Beach charter |
| Safari | 🦁 | Safari |
| Backpacking | 🎒 | Backpacking |
| Kryssning | 🚢 | Cruise |
| Tågluff | 🚂 | Interrail |
| Camping | ⛺ | Camping |
| Träningsresa | 🏃 | Fitness travel |
| Club 33 | 🎰 | Club 33 |
| Alpresa | ⛷️ | Alps |
| Fjällvandring | 🏔️ | Mountain hiking |

---

## Event Schedule

| Time | Stop |
|------|------|
| 15:30 | Förrätt (starter) |
| 16:45 | Aktivitet 1 — Doppingparken |
| 18:15 | Middag |
| 19:45 | Aktivitet 2 — Gipen |
| 21:00 | Efterrätt (dessert) |
| 22:00 | Sunnerstastugan — Slutfest (closing party) |

---

## Backend API

Base path: `/api/cykelfest/`

| Resource | Endpoints |
|----------|-----------|
| Phases | `GET /phases`, `POST /phases/:id/unlock`, `POST /phases/:id/lock` |
| News | `GET /news`, `POST /news`, `DELETE /news/:id` |
| Teams | `GET /teams`, `POST /teams` |
| Scores | `GET /scores`, `POST /scores` |
| Clues | `GET /clues`, `POST /clues/:id/reveal` |
| Videos | `GET /videos`, `POST /videos`, `POST /videos/:id/mark-seen` |
| Polls | `GET /polls`, `POST /polls`, `POST /polls/:id/vote` |
| Arrivals | `GET /arrivals`, `POST /arrivals/arrive`, `POST /arrivals/depart` |
| Settings | `GET /settings`, `POST /settings/:key` |
| Participants | `GET /participant/:code` |
| Seed | `POST /seed` (populates test data) |

All responses follow the envelope format: `{ data: ... }`.

---

## PWA (Progressive Web App)

The mobile app is also a full PWA served via Expo Web.

| File | Purpose |
|------|---------|
| `mobile/src/app/+html.tsx` | HTML template — max-width 430px centering, dark background for desktop |
| `mobile/public/manifest.json` | PWA manifest with icons and metadata |
| `mobile/public/sw.js` | Service Worker — network-first, cache fallback for offline |
| `mobile/public/icon-192.png` | PWA icon 192×192 |
| `mobile/public/icon-512.png` | PWA icon 512×512, maskable |

**Web compatibility fixes applied:**
- BlurView in BottomNav replaced with solid fallback on web (`rgba(245,239,224,0.96)`)
- `expo-haptics` guarded with `Platform.OS !== 'web'` in all call sites
- Desktop: app centered at max-width 430px with dark background and drop shadow

Install on iPhone: tap Share → "Lägg till på hemskärmen"
Install on Android: Chrome menu → "Lägg till på startskärmen"

---

## Stack

**Mobile / PWA**
- Expo SDK 53, React Native 0.76.7 + react-native-web
- Expo Router (file-based routing, works on web)
- NativeWind + Tailwind v3
- React Query (server state)
- react-native-reanimated v3 (animations)
- lucide-react-native (icons)
- Bun (package manager)

**Backend**
- Bun runtime
- Hono web framework
- Prisma ORM with SQLite
- Zod validation

---

## Environment Variables

**Mobile** (`process.env.EXPO_PUBLIC_*`, bundled at build time):
- `EXPO_PUBLIC_BACKEND_URL` — backend API base URL

**Backend** (validated via Zod in `src/env.ts`):
- `PORT` — server port (default 3000)
- `NODE_ENV`
- `BACKEND_URL`
