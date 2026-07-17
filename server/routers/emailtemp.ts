import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { getEmailTemplates, generateEmailTemplate, createEmailTemplate, getTemplateById, updateEmailTemplate, deleteEmailTemplate } from '../controllers/emailtempController';

export const emailtempRouter = router({
  getTemplates: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      const result = await getEmailTemplates({ businessId: input.businessId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  generateTemplate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1, "Prompt cannot be empty")
    }))
    .mutation(async ({ input }) => {
      const result = await generateEmailTemplate({ prompt: input.prompt });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  createTemplate: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid(),
      name: z.string().min(1, "Template name is required"),
      category: z.string().optional(),
      description: z.string().optional(),
      htmlContent: z.string().min(1, "HTML content is required")
    }))
    .mutation(async ({ input }) => {
      const result = await createEmailTemplate({
        businessId: input.businessId,
        name: input.name,
        category: input.category,
        description: input.description,
        htmlContent: input.htmlContent
      });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  getTemplateById: protectedProcedure
    .input(z.object({
      id: z.string(),
      businessId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      const result = await getTemplateById({
        id: input.id,
        businessId: input.businessId
      });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      businessId: z.string().uuid(),
      name: z.string().min(1, "Template name is required"),
      category: z.string().optional(),
      description: z.string().optional(),
      htmlContent: z.string().min(1, "HTML content is required")
    }))
    .mutation(async ({ input }) => {
      const result = await updateEmailTemplate({
        id: input.id,
        businessId: input.businessId,
        name: input.name,
        category: input.category,
        description: input.description,
        htmlContent: input.htmlContent
      });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      businessId: z.string().uuid()
    }))
    .mutation(async ({ input }) => {
      const result = await deleteEmailTemplate({
        id: input.id,
        businessId: input.businessId
      });
      return { ...result, timestamp: new Date().toISOString() };
    })
});
