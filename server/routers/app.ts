import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const appRouter = router({
  healthCheck: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health',
        tags: ['Health'],
        summary: 'Health check endpoint',
      },
    })
    .input(z.object({}).optional())
    .output(z.object({ status: z.string(), message: z.string() }))
    .query(() => {
      return {
        status: 'success',
        message: 'tRPC API is healthy',
      };
    }),

  getTmpJSON: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/tmp',
        tags: ['Health'],
        summary: 'GetTmpJSON endpoint',
      },
    })
    .input(z.object({}).optional())
    .output(z.object({ status: z.string(), message: z.string(), timestamp: z.string() }))
    .query(() => {
      return {
        status: 'success',
        message: 'This second Route created by Pawan',
        timestamp: new Date().toISOString()
      };
    }),
});

export type AppRouter = typeof appRouter;
