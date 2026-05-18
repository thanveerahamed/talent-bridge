# TalentBridge

A platform that connects job seekers with talent connectors (referrers) who can help them get noticed at companies. Built as an open-source project.

## What It Does

- **Seekers** browse and search for people at companies they're interested in, then reach out via their preferred contact method.
- **Referrers** create a profile listing their company and how they'd like to be contacted. They can hide/show their profile at any time.
- **Admins** review and approve referrer listings, manage users, and monitor platform activity.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Firebase (Auth, Firestore, Functions)
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **UI:** shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Firebase config values

# Start Firebase emulators (Firestore + Auth)
pnpm dev:emulators

# In another terminal, start the dev server
pnpm dev
```

### Seed Data

```bash
# Seed your first admin user (emulators must be running)
pnpm seed:admin your@email.com --emulator

# Seed 50 dummy referrer profiles for testing
pnpm seed:referrers
```

## Scripts

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `pnpm dev`                | Start Vite dev server on port 4011             |
| `pnpm dev:emulators`      | Start Firebase emulators with data persistence |
| `pnpm build`              | Type-check and build for production            |
| `pnpm seed:admin <email>` | Promote a user to admin                        |
| `pnpm seed:referrers`     | Seed 50 test referrer profiles                 |

## Project Structure

```
src/
├── app/
│   ├── layouts/        # App shell, auth layout
│   └── routes/         # Page components (seeker, referrer, admin)
├── components/         # Shared UI components
├── hooks/              # Custom React hooks
├── lib/                # Firebase config, Firestore helpers, auth
├── stores/             # Zustand stores
└── types/              # TypeScript type definitions
```

## Features

- 🔍 Browse & search referrers by company name
- 📄 Referrer profiles with preferred contact methods
- 👁️ Profile visibility toggle
- 📋 Pagination on search results
- 🛡️ Admin approval workflow with rejection reasons
- 🎨 Dark/light mode
- 📱 Fully responsive (mobile-first)
- 🗑️ Account deletion (removes all user data)
- 🔒 Privacy-first — no tracking, no ads, no data selling

## License

See [LICENSE](./LICENSE) for details.
