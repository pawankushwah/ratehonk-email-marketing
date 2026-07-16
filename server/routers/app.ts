import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { verifyDomain, checkDomainStatus, sendDomainVerificationEmail, confirmDomainToken, getUserDomains, deleteDomain } from '../controllers/domainController';
import { sendCampaignEmail } from '../controllers/emailController';
import { authRouter } from './auth';
import { contactRouter } from './contact';
import { onboardingRouter } from './onboarding';
import { userRouter } from './user';
import { saasRouter } from './saas';
import { uploadRouter } from './upload';
import { audienceRouter } from './audience';
import { tagsRouter } from './tags';
import { apiKeyRouter } from './apiKey';

export const appRouter = router({
  auth: authRouter,
  contact: contactRouter,
  onboarding: onboardingRouter,
  user: userRouter,
  saas: saasRouter,
  upload: uploadRouter,
  audience: audienceRouter,
  tags: tagsRouter,
  apiKeys: apiKeyRouter,

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

  domainVerification: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/domains/verify',
        tags: ['Domain'],
        summary: 'Endpoint to verify email domain',
      },
    })
    .input(z.object({ domain: z.string() }))
    .output(z.any())
    // calls the domain verification controller
    .mutation(async ({ input, ctx }) => {
      const { domain } = input;
      const result = await verifyDomain({ domain, userId: ctx.user.userId });
      console.log("result", result);
      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    }),

  sendDomainVerificationEmail: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/domains/send-verification',
        tags: ['Domain'],
        summary: 'Send verification email to domain',
      },
    })
    .input(z.object({ email: z.string().email() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const result = await sendDomainVerificationEmail({ email: input.email, userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  confirmDomainToken: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/domains/confirm-token',
        tags: ['Domain'],
        summary: 'Confirm domain verification token',
      },
    })
    .input(z.object({ token: z.string() }))
    .output(z.any())
    .mutation(async ({ input }) => {
      const result = await confirmDomainToken({ token: input.token });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  getUserDomains: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/domains/user',
        tags: ['Domain'],
        summary: 'Get user verified domains',
      },
    })
    .input(z.object({}).optional())
    .output(z.any())
    .query(async ({ ctx }) => {
      const result = await getUserDomains({ userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  deleteDomain: protectedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/domains/{id}',
        tags: ['Domain'],
        summary: 'Delete a user domain',
      },
    })
    .input(z.object({ id: z.string() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const result = await deleteDomain({ id: input.id, userId: ctx.user.userId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  domainStatus: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/domains/status',
        tags: ['Domain'],
        summary: 'Endpoint to check domain verification status',
      },
    })
    .input(z.object({ domain: z.string() }))
    .output(z.any())
    .query(async ({ input }) => {
      const { domain } = input;
      const result = await checkDomainStatus({ domain });
      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    }),

  sendEmail: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/emails/send',
        tags: ['Emails'],
        summary: 'Send a campaign email',
      },
    })
    .input(z.object({
      fromEmail: z.string().email(),
      toEmail: z.string().email(),
      subject: z.string(),
      htmlBody: z.string(),
    }))
    .output(z.any())
    .mutation(async ({ input }) => {
      const result = await sendCampaignEmail(input);
      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    }),
});

export type AppRouter = typeof appRouter;

