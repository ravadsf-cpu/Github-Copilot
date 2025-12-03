# Cleary News (Next.js App Router)

This is the new Next.js + TypeScript rebuild. The original landing page remains in your existing app; here we focus on feed, shorts, personalization, and API routes.

## Setup

- Ensure Node.js 18+
- Create a `.env.local` with:
  - DATABASE_URL=postgres://...
  - NEXTAUTH_URL=http://localhost:3000
  - NEXTAUTH_SECRET=generate_a_secret
  - GOOGLE_CLIENT_ID=...
  - GOOGLE_CLIENT_SECRET=...

Then install dependencies and run dev.

## Pages
- `/feed` — main news feed with neon cards and ticker
- `/shorts` — vertical short videos

## API
- `/api/articles` — aggregated articles
- `/api/shorts` — shorts list

Prisma models included for users, articles, interactions, and bookmarks.
