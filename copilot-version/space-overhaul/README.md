# Space News Overhaul

A futuristic, immersive news application with a neon-space theme, personalized feeds, and a TikTok-style Shorts experience.

## Features

- **Immersive UI**: Dark space theme with neon accents and smooth animations.
- **Home Feed**: Infinite scroll with personalized article recommendations.
- **Shorts Feed**: Vertical video scroll with strict filtering (max 2:30 duration, no unwanted content).
- **Personalization**: Tracks user engagement to tailor content.
- **Offline Support**: Caches content for offline reading.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: SQLite (Dev) / Postgres (Prod) with Prisma
- **State**: React Hooks + Context

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open App**:
   - Landing Page: `http://localhost:3000`
   - News Feed: `http://localhost:3000/feed`
   - Shorts: `http://localhost:3000/shorts`

## Project Structure

- `src/app`: Next.js App Router pages.
- `src/components`: Reusable UI components (ArticleCard, ShortsVideo, etc.).
- `src/styles`: Global styles and theme variables.
- `prisma`: Database schema.
