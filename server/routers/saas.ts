import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../db';
import { subscriptionPlans, userSubscriptions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const saasRouter = router({
  createPlan: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      monthlyPrice: z.number().default(0),
      emailLimit: z.number().default(0),
      contactLimit: z.number().default(0),
      dailyEmailLimit: z.number().default(0),
      templatesAllowed: z.string().default('basic'),
      modules: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      // In a real app, verify ctx.user is an admin here
      if (ctx.user.role !== 'SUPERADMIN' && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const [newPlan] = await db.insert(subscriptionPlans).values({
        name: input.name,
        description: input.description,
        monthlyPrice: input.monthlyPrice,
        emailLimit: input.emailLimit,
        contactLimit: input.contactLimit,
        dailyEmailLimit: input.dailyEmailLimit,
        templatesAllowed: input.templatesAllowed,
        modules: input.modules,
      }).returning();

      return { success: true, plan: newPlan };
    }),

  getPlans: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'SUPERADMIN' && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      const plans = await db.query.subscriptionPlans.findMany({
        orderBy: (plans, { desc }) => [desc(plans.createdAt)],
      });
      return { success: true, plans };
    }),

  assignSubscription: protectedProcedure
    .input(z.object({
      userId: z.string(),
      planId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'SUPERADMIN' && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const [subscription] = await db.insert(userSubscriptions).values({
        userId: input.userId,
        planId: input.planId,
        status: 'active',
      }).returning();

      return { success: true, subscription };
    }),

  getActiveSubscriptions: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'SUPERADMIN' && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const subscriptions = await db.query.userSubscriptions.findMany({
        with: {
          user: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          plan: {
            columns: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: (subs, { desc }) => [desc(subs.createdAt)],
      });

      return { success: true, subscriptions };
    }),
    
  getUsers: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'SUPERADMIN' && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      
      const allUsers = await db.query.users.findMany({
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)],
      });
      return { success: true, users: allUsers };
    })
});

export type SaasRouter = typeof saasRouter;
