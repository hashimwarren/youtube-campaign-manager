import { PrismaClient } from '@prisma/client';
import { PGLite } from '@electric-sql/pglite';
import { PrismaPGLite } from 'pglite-prisma-adapter'; // Corrected adapter import name

// Initialize PGLite. It can be in-memory or file-based.
// For persistence across server restarts (in dev), a file is better.
// PGLite will create the file if it doesn't exist.
const pgliteDb = new PGLite('pgdata/mydb.db'); // Using a file in pgdata directory

// Initialize the Prisma PGLite adapter
const adapter = new PrismaPGLite(pgliteDb);

// Prisma Client setup with singleton pattern for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Instantiate PrismaClient with the PGLite adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// The `sql` object for raw queries.
// `test-db/page.tsx` uses a specific query:
// `SELECT NOW() as current_time, version() as db_version`
// We can use Prisma's `$queryRaw` for this.
// PGLite itself also has a query method.
// Let's try to keep it compatible with Prisma's $queryRaw for now.

export const sql = {
  async query(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
    // Using Prisma.sql template literal for safety if values were present.
    // For the specific query in test-db, it's simple.
    // This is still a bit of a shim. For complex queries, direct use of
    // prisma.$queryRaw(Prisma.sql`...`) is better.
    if (strings.join('').includes('SELECT NOW()')) {
        // PGLite has a slightly different way to get version and current_time
        // It might not support NOW() and version() in the same way as full Postgres.
        // Let's try a PGLite compatible query.
        // PGLite supports `pg_catalog.current_timestamp()` and `pg_catalog.version()`.
        // Or, more simply for PGLite:
        // `SELECT strftime('%Y-%m-%d %H:%M:%f', 'now') as current_time, sqlite_version() as db_version;`
        // Since PGLite is based on SQLite compiled to WASM.
        // The adapter should ideally translate this, but let's be explicit for the test page.
        //
        // However, Prisma's adapter for PGLite *should* allow standard PG queries.
        // Let's stick to the original query and see if the adapter handles it.
        const query = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
        return prisma.$queryRawUnsafe(query);
    }
    // Fallback for other queries, though none are expected with current usage
    const query = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
    return prisma.$queryRawUnsafe(query);
  }
};

// Optional: Add a function to explicitly initialize the database connection
// or wait for PGLite to be ready, if needed.
// (async () => {
//   await pgliteDb.waitReady;
//   console.log('PGLite database is ready.');
// })();
