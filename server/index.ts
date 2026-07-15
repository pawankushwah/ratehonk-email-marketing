import express, { Request, Response } from 'express';
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

dotenv.config();

const app = express();
const PORT = process.env.SER_DEV_PORT || 5000;
const BASE_URL = process.env.SER_BASE_URL || `http://localhost:${PORT}`;

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

// Base route
app.get('/', (req: Request, res: Response) => {
  res.send('Ratehonk tRPC & Express API is running. Go to /docs for API Reference.');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('[Express Global Error]:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'An internal server error occurred' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`tRPC endpoint at ${BASE_URL}/trpc`);
  console.log(`REST endpoint at ${BASE_URL}/api`);
  console.log(`Scalar Docs at ${BASE_URL}/docs`);
});
