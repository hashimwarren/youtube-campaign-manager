# Dependency Checklist for YouTube Campaign Manager

Below is a checklist of dependencies that are recommended by the project context but are **not yet present** in your `package.json`:

## Main dependencies to add

- [x] zod # For event validation (Inngest events)
- [x] @prisma/client # Prisma ORM client for Neon Postgres
- [x] prisma # Prisma CLI (devDependency)
- [x] @slack/webhook # Slack bot integration
- [x] googleapis # Google Sheets API v4
- [x] recharts # Charting library
- [x] shadcn/ui # UI component library #fetch https://ui.shadcn.com/docs/installation/next

## Testing dependencies to add

- [x] jest # Testing framework
- [x] ts-jest # TypeScript preprocessor for Jest
- [x] @testing-library/react # React component testing
- [x] nock # HTTP mocking
- [x] supertest # API route testing

## (Optional) Linting/Formatting

- [x] prettier # Code formatter (if not already present)

---

## Shadcn/ui Components Checklist

This list is based on the project's requirements for a Kanban-style CRM, video tracking, and dashboards.

- [x] **Button**: For all interactive elements.
- [x] **Card**: Core component for Kanban items (creators/campaigns) and dashboard widgets.
  - [x] `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- [x] **Dialog**: For modals (e.g., editing creator details, viewing campaign info).
- [x] **Input**: For forms (e.g., creator name, email, campaign details).
- [x] **Label**: For form inputs.
- [x] **Select**: For dropdowns (e.g., filtering by status, selecting creator).
- [x] **Table**: For displaying lists of creators, campaigns, or video snapshots.
  - [x] `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- [x] **Tabs**: For switching between different views (e.g., Kanban board, list view, dashboard sections).
- [x] **DropdownMenu**: For context menus or action lists on items (e.g., edit, archive).
- [x] **Avatar**: To display creator profile images or initials.
- [x] **DatePicker**: For selecting dates (e.g., `wentLiveAt` for campaigns). <!-- Corresponds to 'calendar' -->
- [x] **Popover**: For popover content. <!-- Added based on installation log -->
- [x] **Sheet**: Alternative to Dialog for side panels (e.g., quick view of details).
- [x] **Tooltip**: For providing extra information on hover.
- [x] **Badge**: For displaying status (e.g., `CreatorStatus`).
- [x] **Separator**: For visual separation of UI elements.
- [x] **Skeleton**: For loading states while data is being fetched.
- [x] **Toast**: For displaying notifications. <!-- Corresponds to 'sonner' -->

Absolutely—let’s swap every instance of “Sponsorship Pulse” for **“YouTube Campaign Manager”** so the branding is tidy from day one. Below are the quick-touch updates you’ll want to make across code, docs, and design artifacts.
