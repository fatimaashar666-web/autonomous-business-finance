# Architecture Overview

## Autonomous Business Finance Platform

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │           React + TypeScript + Vite            │  │
│  │              (Tailwind CSS)                    │  │
│  │                Port: 5173                      │  │
│  └─────────────────────┬─────────────────────────┘  │
└────────────────────────┼────────────────────────────┘
                         │ HTTP (REST API)
                         │ Proxy: /api → :3000
                         ▼
┌─────────────────────────────────────────────────────┐
│               NestJS Backend Server                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │        NestJS + TypeScript + Prisma ORM       │  │
│  │                Port: 3000                      │  │
│  │          Prefix: /api                          │  │
│  └─────────────────────┬─────────────────────────┘  │
└────────────────────────┼────────────────────────────┘
                         │ Prisma Client
                         ▼
┌─────────────────────────────────────────────────────┐
│                   PostgreSQL                         │
│                  Port: 5432                          │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React 19, TypeScript, Vite     |
| Styling    | Tailwind CSS                   |
| Backend    | NestJS, TypeScript             |
| ORM        | Prisma                         |
| Database   | PostgreSQL                     |
| API        | REST (JSON)                    |
| Linting    | ESLint, Prettier               |

### Folder Structure

```
autonomous-business-finance/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── api/       # API client and interceptors
│   │   ├── assets/    # Static assets
│   │   ├── components/# Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── layouts/   # Page layout components
│   │   ├── pages/     # Route-level page components
│   │   ├── types/     # TypeScript type definitions
│   │   └── utils/     # Utility functions
│   └── ...
├── backend/           # NestJS application
│   ├── src/
│   │   ├── common/    # Shared filters, interceptors, pipes
│   │   ├── config/    # Configuration module
│   │   ├── health/    # Health check module
│   │   ├── prisma/    # Prisma service module
│   │   └── ...
│   ├── prisma/        # Prisma schema and migrations
│   └── ...
├── docs/              # Project documentation
└── README.md          # Setup instructions
```

### API Design

- All backend routes are prefixed with `/api`
- The frontend dev server proxies `/api` requests to the backend
- Health check endpoint: `GET /api/health`

### Environment Configuration

All secrets and configuration are loaded from `.env` files:

- `backend/.env` — Database URL, port, NODE_ENV
- `frontend/.env` — API base URL (if needed)

No credentials are hardcoded anywhere in the source code.
