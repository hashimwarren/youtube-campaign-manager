import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

// Configuration
const config = {
  host: "0.0.0.0", // Listen on all interfaces
  port: 5433, // Default PGLite port, ensure it doesn't conflict
  database: {
    path: "./pgdata", // Directory to store the database file
    // You can add more PGLite constructor options here if needed
  },
  auth: {
    // For simplicity, we'll disable auth for now.
    // In a production environment, you should implement proper authentication.
    // secret: "your-secure-secret-for-jwt-or-other-auth-tokens",
  },
};

async function main() {
  const pgliteModule = await import("@electric-sql/pglite");
  console.log("Imported @electric-sql/pglite module:", pgliteModule);

  if (!pgliteModule.PGlite) {
    console.error("PGlite export not found directly in module:", pgliteModule);
    if (pgliteModule.default && typeof pgliteModule.default === 'function' && pgliteModule.default.name === 'PGlite') {
       console.log("It seems PGlite might be the default export itself and is a function/class.");
       // Attempt to use default export if it looks like PGlite constructor
       const PGLite = pgliteModule.default;
       const pglite = new PGLite(config.database.path);
       return startServer(pglite); // Refactor server start to a new function
    } else if (pgliteModule.default && pgliteModule.default.PGlite) {
       console.log("Found PGlite nested under default export.");
       const PGLite = pgliteModule.default.PGlite;
       const pglite = new PGLite(config.database.path);
       return startServer(pglite); // Refactor server start to a new function
    }
    throw new Error("PGlite export not found as expected after dynamic import.");
  }

  const PGLite = pgliteModule.PGlite;

  // Initialize PGLite database instance
  const pglite = new PGLite(config.database.path);

  return startServer(pglite); // Refactor server start to a new function
}

async function startServer(pgliteInstance) {
  // Initialize and start the PGLiteSocketServer
  const server = new PGLiteSocketServer(
    pgliteInstance,
    config.host,
    config.port,
    config.auth.secret // This will be undefined if auth.secret is commented out
  );

  console.log(
    `PGLite server listening on ws://${config.host}:${config.port}`
  );

  // Handle server errors
  // server.on("error", (err) => {
  //   console.error("PGLite Server Error:", err);
  // });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down PGLite server...");
    await server.close();
    await pgliteInstance.close();
    console.log("PGLite server shut down.");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Shutting down PGLite server...");
    await server.close();
    await pgliteInstance.close();
    console.log("PGLite server shut down.");
    process.exit(0);
  });

  // Keep the process alive
  setInterval(() => {}, 1 << 30); // Run an empty function very infrequently
}

main().catch(err => {
  console.error("Failed to start PGLite server:", err);
  console.error("Error details:", err.message, err.stack);
  process.exit(1);
});
