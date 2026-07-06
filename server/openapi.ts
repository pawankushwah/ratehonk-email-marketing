import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from './routers/app';

// Generate OpenAPI document from tRPC router
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Ratehonk API',
  description: 'OpenAPI compliant API built using tRPC.',
  version: '1.0.0',
  baseUrl: process.env.SER_BASE_URL
    ? `${process.env.SER_BASE_URL}/api`
    : `http://localhost:${process.env.SER_DEV_PORT || 5000}/api`,
});
