import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  setActiveApiKey,
} from '../controllers/apiKeyController';

export const apiKeyRouter = router({
  getApiKeys: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/api-keys',
        tags: ['API Keys'],
        summary: 'Get all API keys for the user',
      },
    })
    .input(z.object({}).optional())
    .output(z.any())
    .query(async ({ ctx }) => {
      const result = await getApiKeys({ userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  createApiKey: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/api-keys',
        tags: ['API Keys'],
        summary: 'Create a new API key',
      },
    })
    .input(
      z.object({
        provider: z.string(),
        name: z.string().optional(),
        key: z.string(),
      })
    )
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const result = await createApiKey({ ...input, userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  updateApiKey: protectedProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/api-keys/{id}',
        tags: ['API Keys'],
        summary: 'Update an existing API key',
      },
    })
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        key: z.string().optional(),
      })
    )
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const result = await updateApiKey({ ...input, userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  deleteApiKey: protectedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/api-keys/{id}',
        tags: ['API Keys'],
        summary: 'Delete an API key',
      },
    })
    .input(z.object({ id: z.string() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const result = await deleteApiKey({ id: input.id, userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  setActiveKey: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/api-keys/{id}/active',
        tags: ['API Keys'],
        summary: 'Set an API key as active for a provider',
      },
    })
    .input(z.object({ id: z.string(), provider: z.string() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const result = await setActiveApiKey({
        id: input.id,
        provider: input.provider,
        userId: ctx.user.userId,
      });
      return { ...result, timestamp: new Date().toISOString() };
    }),
});
