# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for "jobmate" containing three separate applications:
- **web/**: Nuxt 4 web application with AI chat functionality
- **app/**: React Native mobile app built with Expo
- **backend/**: NestJS API server

Each application is independent with its own package.json and dependencies.

## Build & Development Commands

### Web Application (Nuxt 4)
```bash
cd web
pnpm install          # Install dependencies
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm lint:format      # Fix linting and format in one command
```

### Mobile App (Expo/React Native)
```bash
cd app
npm install           # Install dependencies
npm start             # Start Expo dev server
npm run android       # Run on Android emulator
npm run ios           # Run on iOS simulator
npm run web           # Run in web browser
npm run lint          # Run ESLint
```

### Backend (NestJS)
```bash
cd backend
pnpm install          # Install dependencies
pnpm run start:dev    # Start dev server with watch mode
pnpm run start        # Start server
pnpm run start:prod   # Start production server
pnpm run build        # Build the application
pnpm run lint         # Run ESLint with auto-fix
pnpm run format       # Format code with Prettier
pnpm run test         # Run unit tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:cov     # Run tests with coverage
pnpm run test:e2e     # Run e2e tests
```

## Architecture

### Web Application (web/)
- **Framework**: Nuxt 4 with TypeScript
- **UI Framework**: Nuxt UI 4.0 (design system built on Tailwind CSS)
- **AI Integration**: Vercel AI SDK (@ai-sdk/vue, @ai-sdk/openai)
- **Key Modules**: Content, ESLint, Image, Scripts, Test Utils, Nuxt Hints
- **Styling**: Tailwind CSS via Nuxt UI
- **API Routes**: Server routes in `server/api/` (e.g., `server/api/chat.ts` for AI streaming)
- **Auto-imports**: Components, composables, and utilities are auto-imported following Nuxt conventions

**Directory Structure**:
- `app/components/`: Vue components (auto-imported)
- `app/composables/`: Vue composables (auto-imported)
- `app/layouts/`: Layout components (dashboard.vue, default.vue)
- `app/pages/`: File-based routing pages
- `app/assets/css/`: Global CSS including main.css
- `server/api/`: Server API routes

**AI Chat Implementation**:
- Chat UI uses `@ai-sdk/vue` Chat class with `@nuxt/ui` components (UChatPalette, UChatMessages, UChatPrompt)
- Backend streaming endpoint at `/api/chat` using `streamText` from Vercel AI SDK
- Messages rendered as markdown using MDC component
- OpenAI API key configured via `NUXT_OPENAI_API_KEY` environment variable in `.env`

**MCP Server**: The web app uses a Nuxt UI MCP server configured in `.cursor/mcp.json` for component assistance.

### Mobile App (app/)
- **Framework**: Expo SDK ~53.0 with React Native 0.79
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind 4.1 (Tailwind CSS for React Native)
- **React Version**: React 19.0.0
- **UI Libraries**: Expo components (expo-image, expo-blur, expo-symbols)
- **Directory**: `app/` directory contains file-based routes (_layout.tsx, index.tsx)

### Backend (backend/)
- **Framework**: NestJS 9 with TypeScript
- **Testing**: Jest with ts-jest
- **Structure**: Standard NestJS modular architecture
  - `src/app.module.ts`: Root module
  - `src/main.ts`: Application entry point (runs on port 3000)
  - `src/app.controller.ts`: Main controller
  - `src/app.service.ts`: Main service
- **Test Configuration**: Unit tests use Jest, e2e tests in `test/` directory

## Package Managers

- **web/**: Uses `pnpm` (has pnpm-lock.yaml)
- **app/**: Uses `npm` (has package-lock.json)
- **backend/**: Uses `pnpm` (has pnpm-lock.yaml)

Always use the appropriate package manager for each workspace.

## Pull Request Conventions

This repository uses conventional commits. PR titles should follow the format:
- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `docs(scope): description` - Documentation updates
- `chore(scope): description` - Build/tooling updates

Where scope is typically: `web`, `app`, or `backend`.

Example: `feat(web): implement nuxt hint to watching performance issue`

See `.github/PULL_REQUEST_TEMPLATE.md` for the PR checklist and type options.

## Environment Variables

### Web Application
Create `web/.env` with:
```
NUXT_OPENAI_API_KEY=your-openai-api-key
```

## TypeScript Configuration

Each workspace has its own tsconfig.json. The web application also generates a `.nuxt/tsconfig.json` with Nuxt-specific types.

## Key Dependencies to Be Aware Of

### Web
- `@nuxt/ui`: Main UI component library (v4.0)
- `ai` & `@ai-sdk/vue`: Vercel AI SDK for chat functionality
- `@nuxt/content`: Content management
- `zod`: Runtime type validation (v4.1)

### App
- `expo-router`: File-based navigation
- `nativewind`: Tailwind for React Native
- `react-native-reanimated` & `react-native-gesture-handler`: Animations and gestures

### Backend
- Standard NestJS dependencies with minimal additional packages
