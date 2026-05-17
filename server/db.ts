/**
 * Prisma client singleton — safe for Next.js hot reload in development.
 *
 * Prisma 7 requires a driver adapter. We use @prisma/adapter-pg with the
 * standard `pg` Pool, configured via the DATABASE_URL environment variable.
 *
 * In development, Next.js clears the Node.js module cache on every reload,
 * which would create a new PrismaClient instance each time and exhaust the
 * database connection pool. We store the instance on the global object to
 * reuse it across hot reloads.
 *
 * In production, module-level singletons work fine because the process is
 * long-lived, so we just export a regular instance.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

export const DEFAULT_DATABASE_URL =
  "postgresql://picaflor:picaflor@localhost:5433/picaflor_ink?schema=public";

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
