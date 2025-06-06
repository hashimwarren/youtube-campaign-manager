# 👉 Project context

This is a CRM tool for YouTube creators, built to help manage sponsorships and track video performance.
It is designed to be a **Kanban-style** application with the following features:

- Core jobs:
  1. CRM for YouTube creators (Kanban pipeline).
  2. Track _sponsored_ videos once a week and store **views** + **comment count** snapshots.
  3. (Later stages) topic discovery and dashboards.
- Runs on **Next.js 14 (app router) + TypeScript** and dog-foods **Inngest** functions.

# 👉 Tech stack to prefer

- Inngest (`inngest`, `@inngest/next`) for cron schedules and webhooks.
- **Neon Postgres** via **Prisma** ORM; use the schema below as the single source of truth.
- UI: shadcn/ui components + Tailwind; no custom CSS unless unavoidable.

- Testing: **Jest**, `ts-jest`, `@testing-library/react`, **nock** for HTTP mocks, **supertest** for API routes.
- Charts: **Recharts** (no seaborn/d3).

# 👉 Data models (Prisma)

```prisma
model Creator {
  id          String   @id @default(cuid())
  name        String
  channelId   String   @unique
  email       String?
  status      CreatorStatus
  pitchNotes  Json?
  campaigns   Campaign[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Campaign {
  id          String   @id @default(cuid())
  creatorId   String
  creator     Creator  @relation(fields: [creatorId], references: [id])
  videoId     String   @unique            // YouTube video ID
  title       String
  wentLiveAt  DateTime
  costUsd     Float?
  snapshots   VideoMetricSnapshot[]
  notes       Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model VideoMetricSnapshot {
  id          Int      @id @default(autoincrement())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id])
  views       Int
  comments    Int
  capturedAt  DateTime @default(now())
}

enum CreatorStatus {
  LEAD        // researching
  PITCHED
  NEGOTIATING
  LIVE        // video published
  ARCHIVED
}
```

````

# 👉 Inngest guidelines

- Always import the singleton with

  ```ts
  import { inngest } from "@/inngest/client";
  ```

- Define events in `src/inngest/events.ts` with **zod** validation.
- Weekly metrics cron: `schedule: "0 7 * * 1"` (Monday 07:00 America/New_York).
- Break long jobs into **step.run** blocks; enable automatic retries.

# 👉 File & folder conventions

```
apps/web            # Next.js app-router
  └── app
      ├─ creators/(pipeline)      # Kanban board pages
      ├─ api/(auth|crm|seed)      # Route handlers
      └─ dashboard
packages/db         # Prisma schema + generated client
packages/jobs       # inngest functions
```

# 👉 Coding style

- Use **async/await**, `try/catch` with typed error narrowing.
- Prefer `const` and explicit return types.
- Follow ESLint “@typescript-eslint/strict-boolean-expressions”.
- Run Prettier default rules (80 cols, semicolons, single quotes).

# 👉 Testing patterns

- Unit-test business utils (e.g., `computeMilestone`) in `__tests__/`.
- Mock YouTube API with `nock` and assert DB side-effects.
- Freeze time with `jest.useFakeTimers()` for cron tests.

# 👉 Things to avoid

- No direct SQL; always use Prisma Client.
- No in-memory data for production paths.
- Do not suggest serverless functions other than Inngest.

# 👉 Example tasks Copilot should excel at

- Scaffold an Inngest cron that loops over campaigns, hits `youtube.videos.list`, and writes snapshots.
- Generate a shadcn Card that renders snapshot history as a line chart with Recharts.

```

Add this file, commit, and Copilot will align its suggestions with your exact stack, schema, and coding preferences.
::contentReference[oaicite:0]{index=0}
```
````
