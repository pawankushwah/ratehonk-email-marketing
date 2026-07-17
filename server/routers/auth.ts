import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import * as authController from '../controllers/authController';

export const authRouter = router({
  register: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/register', tags: ['auth'], summary: 'Register a new business and admin user' } })
    .input(z.object({
      businessName: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6)
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string()
    }))
    .mutation(authController.register),

  verifyRegistration: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/verify', tags: ['auth'], summary: 'Verify registration token' } })
    .input(z.object({
      token: z.string(),
      forceLogout: z.boolean().optional(),
      logoutSessionId: z.string().optional()
    }))
    .output(z.object({
      success: z.boolean(),
      token: z.string().optional(),
      refreshToken: z.string().optional(),
      user: z.any().optional(),
      message: z.string().optional(),
      requiresLogout: z.boolean().optional(),
      activeSessions: z.array(z.any()).optional()
    }))
    .mutation(authController.verifyRegistration),

  login: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/login', tags: ['auth'], summary: 'Login user' } })
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
      rememberMe: z.boolean().optional(),
      forceLogout: z.boolean().optional(),
      logoutSessionId: z.string().optional()
    }))
    .output(z.object({
      success: z.boolean(),
      token: z.string().optional(),
      refreshToken: z.string().optional(),
      user: z.any().optional(),
      message: z.string().optional(),
      requiresLogout: z.boolean().optional(),
      activeSessions: z.array(z.any()).optional()
    }))
    .mutation(authController.login),

  refreshToken: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/auth/refresh', tags: ['auth'], summary: 'Refresh JWT token', protect: true } })
    .input(z.void())
    .output(z.object({
      success: z.boolean(),
      token: z.string(),
      refreshToken: z.string(),
      user: z.any()
    }))
    .query(authController.refreshToken),

  logout: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/logout', tags: ['auth'], summary: 'Logout user' } })
    .input(z.void())
    .output(z.object({
      success: z.boolean()
    }))
    .mutation(authController.logout),

  listSessions: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/auth/sessions', tags: ['auth'], summary: 'List active sessions for user', protect: true } })
    .input(z.void())
    .output(z.object({
      success: z.boolean(),
      sessions: z.array(z.any())
    }))
    .query(authController.listSessions),

  revokeSession: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/sessions/revoke', tags: ['auth'], summary: 'Revoke a specific session', protect: true } })
    .input(z.object({ sessionId: z.string() }))
    .output(z.object({
      success: z.boolean(),
      message: z.string()
    }))
    .mutation(authController.revokeSession),

  getSession: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/auth/me', tags: ['auth'], summary: 'Get current session user info', protect: true } })
    .input(z.void())
    .output(z.object({
      success: z.boolean(),
      user: z.any()
    }))
    .query(authController.getSession)
});
