import express, { Request, Response } from 'express';
import path from 'path';
import { createApiApp } from './src/server-app';

async function startServer() {
  const app = createApiApp();
  const PORT = 3000;

  // Vite middleware for development vs static production serving.
  // This branch only runs for local/Codespaces dev — it's not used when the
  // API is deployed as a Vercel serverless function (see api/index.ts),
  // since Vercel serves the built static frontend itself.
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aqua-Seal Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
