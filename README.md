# Autonomous Business Finance Platform (Capstone Edition)

> Industrial-grade, browser-based autonomous business finance platform powered by a coordinated multi-agent AI architecture.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Multi-Agent AI Architecture](#multi-agent-ai-architecture)
- [Week 7 Engineering Concepts](#week-7-engineering-concepts)
- [Centralized Financial Data Engine](#centralized-financial-data-engine)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Testing & Validation](#testing--validation)

---

## Architectural Overview

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite 8 UI                 │
│  - Financial KPIs & Runway Cards                       │
│  - 14-Day Forward Cash Curve Chart                     │
│  - Departmental Budget Utilization                     │
│  - Live Transaction Ledger & Anomaly Badges            │
│  - Multi-Agent Audit Trail Stream                      │
│  - Human-in-the-Loop Action Approval Gate              │
│  - AI Finance Assistant Conversational Terminal        │
└───────────────────────────┬────────────────────────────┘
                            │ /api/* (Vite Proxy)
                            ▼
┌────────────────────────────────────────────────────────┐
│               NestJS 12 Orchestration Core             │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Multi-Agent Orchestrator               │  │
│  │  - Intent Routing & Task Delegation              │  │
│  │  - Synthesis of Specialized Agent Outputs        │  │
│  └──────┬────────────┬────────────┬───────────┬─────┘  │
│         │            │            │           │        │
│         ▼            ▼            ▼           ▼        │
│   ┌───────────┐┌───────────┐┌───────────┐┌──────────┐  │
│   │ Analyst   ││ Expense   ││ Cash Flow ││ Budget   │  │
│   │ Agent     ││ Agent     ││ Agent     ││ Agent    │  │
│   └───────────┘└───────────┘└───────────┘└──────────┘  │
│         │            │            │           │        │
│         └──────┬─────┴──────┬─────┴───────────┘        │
│                ▼            ▼                          │
│     ┌──────────────────────────────────────┐           │
│     │   Week 7 Sandboxing & Hooks Layer    │           │
│     │   - Pre-execution validation         │           │
│     │   - Post-execution verification      │           │
│     │   - Error catching & audit logging   │           │
│     └──────────────────┬───────────────────┘           │
│                        ▼                               │
│     ┌──────────────────────────────────────┐           │
│     │   Centralized Finance Repository     │           │
│     │   - Real-time Ledger Stream          │           │
│     │   - Departmental Budget Ledgers      │           │
│     │   - AP / AR Invoices                 │           │
│     │   - Prisma ORM + PostgreSQL          │           │
│     └──────────────────────────────────────┘           │
└────────────────────────────────────────────────────────┘
```

---

## Multi-Agent AI Architecture

The platform operates an autonomous financial team comprising 6 specialized agents:

1. **Financial Analyst Agent**:
   - Calculates real-time unit economics: EBITDA, gross margins (72%), operating margins, and calculated runway.
   - Highlights strategic opportunities and risks.
2. **Expense Management Agent**:
   - Autonomously classifies ledger transactions into categories (Cloud Services, Payroll, SaaS, Marketing, Operations, etc.).
   - Runs statistical anomaly detection ($>2.5\sigma$ z-score or $2.5\times$ baseline spike) and flags suspicious expenses.
3. **Cash Flow Management Agent**:
   - Monitors liquid treasury accounts ($689,500 total).
   - Projects 14-day and 30-day forward cash curves, incorporating scheduled Accounts Payable, Accounts Receivable, and payroll cycles.
4. **Budget Planning Agent**:
   - Tracks department expenditures (Engineering, Marketing, Operations, Sales, G&A).
   - Enforces alert thresholds (85% warning, 95% critical) and formulates budget reallocation proposals.
5. **Financial Reporting Agent**:
   - Compiles automated executive P&L statements, balance scorecards, and regulatory compliance digests.
6. **AI Finance Assistant**:
   - Conversational CFO interface in the frontend that accepts natural language queries, coordinates multi-agent delegation, and produces unified executive briefings.

---

## Week 7 Engineering Concepts

- **Sandboxing (`AgentSandbox`)**:
  - Isolates execution context for each agent.
  - Enforces role-based permissions (`READ_FINANCIALS`, `ANALYZE_DATA`, `EXECUTE_BUDGET_REALLOCATION`, etc.).
- **Hooks Framework (`AgentHooksService`)**:
  - *Pre-Execution Hooks*: Validates input parameters, checks security ceilings (e.g. $50,000 reallocation limits).
  - *Post-Execution Hooks*: Measures execution latency and logs successful operational events.
  - *Error & Audit Hooks*: Catches runtime exceptions and maintains an immutable audit log.
- **Human-in-the-Loop Security**:
  - Sensitive operations (e.g. budget reallocations or vendor disputes) enter a `PENDING_APPROVAL` queue.
  - Requires executive sign-off from the dashboard before execution.

---

## Centralized Financial Data Engine

- Schema defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).
- The repository layer provides realistic business data with accounts, categorized transactions, AP/AR invoices, and departmental budgets.
- All simulated data is identified via `isSimulated: true`.

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm run build
npm run start:dev
```
API runs on `http://localhost:3000/api`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Web client opens at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/finance/metrics` | High-level financial KPIs, runway, and cash balances |
| `GET` | `/api/finance/transactions` | Filterable transaction ledger |
| `POST` | `/api/finance/transactions` | Ingest new transaction with auto-categorization & anomaly evaluation |
| `GET` | `/api/finance/budgets` | Departmental budgets and utilization percentages |
| `GET` | `/api/finance/forecast` | Forward cash flow projections |
| `GET` | `/api/finance/actions` | Agent action queue |
| `GET` | `/api/finance/audit-logs` | Immutable audit trail |
| `POST` | `/api/agents/chat` | Conversational query interface with multi-agent orchestration |
| `POST` | `/api/agents/audit` | Trigger full multi-agent financial audit |
| `POST` | `/api/agents/actions/:id/approval` | Human approval gate (approve / reject) |

---

## Testing & Validation

```bash
# Run backend unit, service, and orchestration tests:
cd backend
npm run test

# Run type check and production builds:
cd backend && npm run build
cd ../frontend && npm run build
```
