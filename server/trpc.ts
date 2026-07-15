import { initTRPC, TRPCError } from '@trpc/server';
import { OpenApiMeta } from 'trpc-openapi';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verifyAccessToken } from './utils/jwt';
import crypto from 'crypto';

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  let user = null;

  // 1. Check for token in HttpOnly cookie (preferred)
  let token = (req as any).cookies?.ratehonk_access_token;

  // 2. Fallback to Authorization header (for non-browser clients or legacy)
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token) {
    const decoded = verifyAccessToken(token) as any;
    if (decoded) {
      // Fingerprint Check (Access Token Theft Protection)
      const userAgent = req.headers['user-agent'] || '';
      const currentFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex');
      
      if (decoded.fingerprint && decoded.fingerprint !== currentFingerprint) {
        console.warn(`[Security] Token fingerprint mismatch for user ${decoded.userId}`);
        user = null; // Invalid token due to theft
      } else {
        user = decoded;
      }
    }
  }

  return { req, res, user };
};

type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  errorFormatter({ shape, error }) {
    // Log the error to the server console
    console.error(`[tRPC Error] ${error.code}:`, error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('Stack:', error.stack);
    }

    // In production, mask the error message for internal server errors
    const isProduction = process.env.NODE_ENV === 'production';
    const isInternalError = error.code === 'INTERNAL_SERVER_ERROR';

    return {
      ...shape,
      message: (isProduction && isInternalError)
        ? 'An internal server error occurred'
        : shape.message,
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
