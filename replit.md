# Kamba Kid Pay

## Overview

Kamba Kid Pay is a financial education mobile app for children, built with gamification mechanics. Parents can create tasks, manage rewards, and track their children's financial progress. Children earn virtual currency (Kwanzas - Kz) by completing tasks, which gets distributed across three financial pillars: **Save** (Poupar), **Spend** (Consumir), and **Help/Solidarity** (Solidariedade). The app features a level system, missions with progress tracking, and solidarity campaigns.

The app is primarily in Portuguese, targeting an Angolan audience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the Expo Router (file-based routing) for navigation.
- **Routing**: File-based routing via `expo-router`. Screens live under `app/` with nested folders for `parent/` and `child/` views. Modal screens use `presentation: "modal"` in stack options.
- **State Management**: Currently uses a custom `AuthProvider` context (`lib/auth-context.tsx`) that manages users, tasks, missions, campaigns, wallets, and children all in-memory via AsyncStorage for persistence. This is the central data layer — most data operations (CRUD for tasks, missions, campaigns, child management, wallet calculations) live here rather than going through the backend API.
- **Styling**: Pure React Native `StyleSheet` with a centralized color system (`constants/colors.ts`). Two distinct color themes — dark blue tones for parent views, warm orange/yellow for child views.
- **Fonts**: Nunito font family (Regular, SemiBold, Bold, ExtraBold) loaded via `@expo-google-fonts/nunito`.
- **Animations**: `react-native-reanimated` for enter/exit animations (FadeInDown, FadeInUp).
- **Data Fetching Setup**: TanStack React Query is installed with a query client configured in `lib/query-client.ts`, including an `apiRequest` helper that builds URLs from `EXPO_PUBLIC_DOMAIN`. However, most data currently flows through the local AuthContext rather than API calls.
- **Platform Support**: Primarily mobile (iOS/Android) with web compatibility. Platform-specific safe area inset handling for web vs native.

### Backend (Express)

- **Framework**: Express 5 running as a Node.js server (`server/index.ts`).
- **Current State**: The backend is minimal — it sets up CORS, serves static files for production builds, and has a landing page template. The `server/routes.ts` file has a placeholder for API routes but no actual endpoints are implemented yet.
- **CORS**: Dynamically configured based on Replit environment variables (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`) plus localhost origins for development.
- **Storage**: An in-memory storage layer (`server/storage.ts`) using `MemStorage` class with a basic `IStorage` interface. Currently only has user CRUD operations. This is separate from the client-side AsyncStorage data layer.
- **Build**: Server is bundled with esbuild for production (`server:build` script).

### Database Schema (Drizzle + PostgreSQL)

- **ORM**: Drizzle ORM with PostgreSQL dialect, configured via `drizzle.config.ts`.
- **Current Schema** (`shared/schema.ts`): Only has a `users` table with `id` (UUID, auto-generated), `username`, and `password`. This is a minimal starter schema.
- **Schema Validation**: Uses `drizzle-zod` to generate Zod schemas from Drizzle table definitions.
- **Gap**: The client-side data model (tasks, missions, campaigns, wallets, children) defined in `lib/auth-context.tsx` is much richer than the database schema. These entities need to be added to the Drizzle schema and backed by actual API routes.

### Key Design Decisions

1. **Client-heavy architecture**: Almost all business logic currently lives on the client in the AuthContext, using AsyncStorage as a local database. This was likely done for rapid prototyping but means the app doesn't actually persist data server-side yet.
2. **Dual role system**: The app has distinct UI flows for parents and children, with role-based routing after login. Parents get a dark-themed management dashboard; children get a colorful, gamified interface.
3. **Three-pillar financial model**: Every task reward is categorized into Save/Spend/Help, which feeds into wallet breakdowns and chart visualizations.
4. **Shared types**: The `shared/` directory is used for types shared between frontend and backend (currently just the user schema).

### Development & Build

- **Dev mode**: Two processes needed — `expo:dev` for the Expo dev server and `server:dev` for the Express backend (using `tsx`).
- **Production build**: Custom build script (`scripts/build.js`) that bundles the Expo web app via Metro, then the Express server serves the static output.
- **Database migrations**: Run `npm run db:push` to push Drizzle schema changes to PostgreSQL.
- **Path aliases**: `@/*` maps to project root, `@shared/*` maps to `./shared/*`.

## External Dependencies

- **PostgreSQL**: Database configured via `DATABASE_URL` environment variable. Used with Drizzle ORM for schema management and queries.
- **Expo Services**: Expo SDK for build tooling, OTA updates, and native module access (camera, image picker, haptics, location, crypto).
- **AsyncStorage**: `@react-native-async-storage/async-storage` for client-side data persistence (currently the primary data store).
- **TanStack React Query**: Set up for server-state management but not yet fully utilized with backend APIs.
- **Replit Environment**: The app is configured for Replit deployment, using `REPLIT_DEV_DOMAIN` and related env vars for URL construction and CORS configuration.
- **No external auth service**: Authentication is handled locally with plain password comparison (no hashing visible in the client code). The server-side auth is not yet implemented.