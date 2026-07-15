import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../db';
import { users, businesses } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  
  updateProfile: protectedProcedure
    .meta({ openapi: { method: 'PUT', path: '/user/profile', tags: ['user'], summary: 'Update user profile' } })
    .input(z.object({
      firstName: z.string().min(1, 'First name is required').optional(),
      lastName: z.string().optional(),
      contactNumber: z.string().optional(),
      countryCode: z.string().optional(),
      profilePictureUrl: z.string().optional().or(z.literal(''))
    }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.update(users)
        .set({
          firstName: input.firstName,
          lastName: input.lastName,
          contactNumber: input.contactNumber,
          countryCode: input.countryCode,
          profilePictureUrl: input.profilePictureUrl === '' ? null : input.profilePictureUrl
        })
        .where(eq(users.id, ctx.user.userId));

      return { success: true, message: 'Profile updated successfully' };
    }),

  getBusinesses: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/user/businesses', tags: ['user'], summary: 'Get user businesses' } })
    .input(z.void())
    .output(z.object({
      success: z.boolean(),
      businesses: z.array(z.any())
    }))
    .query(async ({ ctx }) => {
      const userBusinesses = await db.query.businesses.findMany({
        where: eq(businesses.userId, ctx.user.userId),
        orderBy: (businesses, { desc }) => [desc(businesses.createdAt)]
      });
      return { success: true, businesses: userBusinesses };
    }),

  createBusiness: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/user/businesses', tags: ['user'], summary: 'Create new business' } })
    .input(z.object({
      name: z.string().min(1, 'Business name is required'),
      websiteUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
    }))
    .output(z.object({ success: z.boolean(), message: z.string(), businessId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const websiteUrl = input.websiteUrl === '' ? undefined : input.websiteUrl;
      const [newBusiness] = await db.insert(businesses)
        .values({
          name: input.name,
          websiteUrl: websiteUrl,
          userId: ctx.user.userId
        })
        .returning();

      return { success: true, message: 'Business created successfully', businessId: newBusiness.id };
    }),

  updateBusiness: protectedProcedure
    .meta({ openapi: { method: 'PUT', path: '/user/businesses/{id}', tags: ['user'], summary: 'Update business' } })
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Business name is required').optional(),
      websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
      description: z.string().optional(),
      contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
      contactPhone: z.string().optional(),
      contactCountryCode: z.string().optional(),
      logoUrl: z.string().optional().or(z.literal('')),
      bannerUrl: z.string().optional().or(z.literal(''))
    }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Ensure the business belongs to the user
      const existing = await db.query.businesses.findFirst({
        where: and(eq(businesses.id, input.id), eq(businesses.userId, ctx.user.userId))
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Business not found' });
      }

      await db.update(businesses)
        .set({
          name: input.name,
          websiteUrl: input.websiteUrl === '' ? null : input.websiteUrl,
          description: input.description,
          contactEmail: input.contactEmail === '' ? null : input.contactEmail,
          contactPhone: input.contactPhone,
          contactCountryCode: input.contactCountryCode,
          logoUrl: input.logoUrl === '' ? null : input.logoUrl,
          bannerUrl: input.bannerUrl === '' ? null : input.bannerUrl,
          updatedAt: new Date()
        })
        .where(eq(businesses.id, input.id));

      return { success: true, message: 'Business updated successfully' };
    })
});

export type UserRouter = typeof userRouter;