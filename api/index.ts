import { createApiApp } from '../src/server-app';

// Vercel's Node runtime treats any exported request handler in /api as a
// serverless function. An Express app instance is itself a valid
// (req, res) => void handler, so we can export it directly — no app.listen()
// here, Vercel manages the actual HTTP server.
//
// IMPORTANT CAVEAT: storageAdapter (src/lib/storage-adapter.ts) keeps all
// batch/ledger data in memory. On Vercel, each serverless invocation may run
// in a fresh, isolated container, so data created in one request is NOT
// guaranteed to be visible in a later request — it will appear to
// "disappear" randomly as Vercel spins up new instances. This is fine for a
// quick demo of the API shape, but for anything real you'll want to swap
// storageAdapter for a real database (Postgres, etc.) before relying on
// data persisting across requests in production.
const app = createApiApp();

export default app;
