# Wedding Invitation Manager

A Next.js 14 based application to manage wedding invitations, track people networks, and design card templates.

## Tech Stack
- Next.js 14 App Router
- MongoDB & Mongoose
- TailwindCSS
- Custom JWT Authentication Middleware (Edge compatible)
- React Flow (for people graphs)

## Setup

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *Make sure you have MongoDB running locally, or update the `MONGODB_URI` to point to your cluster.*
4. Seed the database with the initial admin account:
   ```bash
   npx ts-node -O '{"module":"CommonJS"}' -r tsconfig-paths/register scripts/seed.ts
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Features Complete
- **Authentication:** Custom edge-compatible JWT auth with RBAC (Admin/User).
- **Core Models:** User, Person, Relationship, Invitation, CardTemplate.
- **People Manager:** Store family and friends, track side (bride/groom) and relationships. Graph view UI implementation ready for hooks.
- **Invitation Logger:** Track sent and received gifts, money, and RSVPs.
- **Card Designer:** Create dynamic card templates and export natively to A5/A6 PDF formats using html2canvas & jsPDF.
- **Admin Panel:** View all registered users in the system. API provided to update roles/delete users.
- **Styling:** Minimal, clean wedding-themed UI with `Inter` and `Playfair Display` fonts.

## Structure
- `/src/models` - Mongoose schemas
- `/src/lib` - database connections and authentication utilities
- `/src/app/api` - REST API endpoints
- `/src/app/(routes)` - App router frontend pages
- `/scripts` - Utilities like database seeding
