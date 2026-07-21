import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';
import { apiReference } from '@scalar/express-api-reference';
import { openApiDocument } from './openapi';
import { appRouter } from './routers/app';
import './queue/emailWorker';
import { createContext } from './trpc';
import next from 'next';

dotenv.config();

const PORT = Number(process.env.PORT) || 5005;
const BASE_URL = process.env.NEXT_PUBLIC_SER_BASE_URL || `http://localhost:${PORT}`;
const dev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = express();

  // ---------- Next.js integration ----------
  const nextApp = next({ dev, dir: '.' });
  await nextApp.prepare();
  const nextHandler = nextApp.getRequestHandler();

  // ---------- Middlewares ----------
  app.use(cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json({ type: ['application/json', 'text/plain'] }));
  app.use(cookieParser());

  // 1. Standard tRPC endpoint (for frontend client)
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // 2. OpenAPI standard REST endpoints (generated from tRPC)
  app.use(
    '/api',
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext,
    } as any)
  );

  // 3. Scalar API Reference UI
  app.use(
    '/docs',
    apiReference({
      spec: {
        content: openApiDocument,
      },
      theme: 'purple',
    })
  );

  app.get('/openapi.json', (req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  // Base route for API
  app.get('/api-status', (req: Request, res: Response) => {
    res.send('Ratehonk tRPC & Express API is running. Go to /docs for API Reference.');
  });

  // Let Next.js handle every other route (pages, static assets, etc.)
  app.use((req: Request, res: Response) => {
    return nextHandler(req, res);
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Express Global Error]:', err);
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({ error: 'An internal server error occurred' });
    } else {
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    console.log(`tRPC endpoint at ${BASE_URL}/trpc`);
    console.log(`REST endpoint at ${BASE_URL}/api`);
    console.log(`Scalar Docs at ${BASE_URL}/docs`);
    console.log(`Next.js pages at ${BASE_URL}/`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
