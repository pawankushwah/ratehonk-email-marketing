import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';
import { apiReference } from '@scalar/express-api-reference';
import { openApiDocument } from './openapi';
import { appRouter } from './routers/app';

dotenv.config();

const app = express();
const PORT = process.env.SER_DEV_PORT || 5000;
const BASE_URL = process.env.SER_BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// 1. Standard tRPC endpoint (for frontend client)
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

// 2. OpenAPI standard REST endpoints (generated from tRPC)
app.use(
  '/api',
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  } as any)
);

// 3. Scalar API Reference UI
app.use(
  '/docs',
  apiReference({
    spec: {
      content: openApiDocument,
    },
    theme: 'purple', // You can change themes (e.g. 'solarized', 'moon', 'default')
  })
);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.send('Ratehonk tRPC & Express API is running. Go to /docs for API Reference.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`tRPC endpoint at ${BASE_URL}/trpc`);
  console.log(`REST endpoint at ${BASE_URL}/api`);
  console.log(`Scalar Docs at ${BASE_URL}/docs`);
});
