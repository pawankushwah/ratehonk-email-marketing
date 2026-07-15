import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { getTags, addTag } from '../controllers/tagController';

export const tagsRouter = router({
  getTags: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      const result = await getTags(input);
      return { ...result, timestamp: new Date().toISOString() };
    }),

  addTag: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid(),
      name: z.string().min(1)
    }))
    .mutation(async ({ input }) => {
      const result = await addTag(input);
      return { ...result, timestamp: new Date().toISOString() };
    })
});
