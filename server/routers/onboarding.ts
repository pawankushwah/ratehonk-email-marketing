import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as onboardingController from '../controllers/onboardingController';

export const onboardingRouter = router({
  updateProfile: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/onboarding/profile', tags: ['onboarding'], summary: 'Update user profile' } })
    .input(z.object({
      userId: z.string().uuid(),
      firstName: z.string().min(1),
      lastName: z.string().min(1)
    }))
    .output(z.object({
      success: z.boolean()
    }))
    .mutation(onboardingController.updateProfile),

  importBrand: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/onboarding/brand', tags: ['onboarding'], summary: 'Import brand details' } })
    .input(z.object({
      businessId: z.string().uuid(),
      websiteUrl: z.string().url().optional().or(z.literal('')),
      logoUrl: z.string().optional().or(z.literal('')),
    }))
    .output(z.object({
      success: z.boolean()
    }))
    .mutation(onboardingController.importBrand),

  saveContacts: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/onboarding/contacts', tags: ['onboarding'], summary: 'Save contact count' } })
    .input(z.object({
      businessId: z.string().uuid(),
      contactCount: z.string()
    }))
    .output(z.object({
      success: z.boolean()
    }))
    .mutation(onboardingController.saveContacts),

  completeOnboarding: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/onboarding/complete', tags: ['onboarding'], summary: 'Complete onboarding process' } })
    .input(z.object({
      businessId: z.string().uuid()
    }))
    .output(z.object({
      success: z.boolean()
    }))
    .mutation(onboardingController.completeOnboarding)
});
