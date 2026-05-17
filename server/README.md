# server/

Server-side logic for Picaflor INK. This directory contains:

- `db.ts` — Prisma client singleton using `@prisma/adapter-pg`
- `queries/` — Typed database query functions
- `auth.ts` — Authentication helpers
- `admin-guard.ts` — Admin route protection helpers

All code in this directory runs exclusively on the server (Node.js runtime).
Never import server-only modules from client components.
