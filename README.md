# IMS - Inventory Management System

A modern inventory management system built with Next.js, Clerk, MongoDB (Mongoose), and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose 9
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: Zustand
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com))

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- `CLERK_SECRET_KEY` - From Clerk Dashboard
- `MONGODB_URL` - Your MongoDB connection string

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (sign-in, sign-up)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Dashboard overview
│   │   └── manage/
│   │       ├── products/         # Product CRUD pages
│   │       └── categories/       # Category CRUD pages
│   ├── layout.tsx                # Root layout with ClerkProvider
│   └── page.tsx                  # Landing page
├── modules/                      # Feature modules
│   ├── product/                  # Product module
│   │   ├── actions/              # Server actions (CRUD)
│   │   └── components/           # Product components
│   ├── category/                 # Category module
│   │   ├── actions/
│   │   └── components/
│   └── dashboard/                # Dashboard module
│       └── actions/
├── shared/                       # Shared code
│   ├── components/
│   │   ├── layouts/              # Sidebar, Header
│   │   └── ui/                   # Pagination, StatusBadge, etc.
│   ├── constants/                # Enums, app constants
│   ├── hooks/                    # useQueryString
│   ├── libs/                     # Mongoose connection
│   ├── schemas/                  # Mongoose schemas
│   ├── stores/                   # Zustand stores
│   └── types/                    # TypeScript types
└── proxy.ts                      # Clerk middleware
```

## Features

- **Authentication** - Clerk-powered sign-in/sign-up
- **Product Management** - Full CRUD with search, filter, pagination
- **Category Management** - Organize products into categories
- **Stock Tracking** - Track stock levels with history
- **Dashboard** - Overview stats, low stock alerts, recent products
- **Responsive UI** - Modern Tailwind CSS design with sidebar navigation

## Prompt example

use context7 to implement clerk, use nextjs, tailwind
Build a inventory management system for my product
