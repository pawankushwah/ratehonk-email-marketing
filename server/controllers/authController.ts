import { TRPCError } from '@trpc/server';
import { db } from '../db';
import { users, businesses, verificationTokens, rolesEnum, refreshTokens } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { emailQueue, redisConnection } from '../queue/emailQueue';
import { getRegistrationTemplate } from '../utils/emailTemplates';
import { UAParser } from 'ua-parser-js';
import net from 'net';

const RATE_LIMIT_WINDOW = 60 * 15; // 15 minutes
const MAX_REQUESTS = 5;

// Helper to get real IP safely
const getClientIp = (req: any): string => {
  const fallbackIp = req?.socket?.remoteAddress || 'unknown_ip';
  const xForwardedFor = req?.headers?.['x-forwarded-for'];
  if (!xForwardedFor) return fallbackIp;

  const ips = xForwardedFor.toString().split(',').map((ip: string) => ip.trim());
  const clientIp = ips[0];

  if (net.isIP(clientIp)) return clientIp;
  return fallbackIp;
};

// Helper function for device info
const getDeviceInfo = (req: any) => {
  const userAgent = req?.headers?.['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const browserResult = parser.getBrowser();
  const osResult = parser.getOS();
  const deviceResult = parser.getDevice();

  const isMobile = deviceResult.type === 'mobile' || deviceResult.type === 'tablet';
  const browserName = browserResult.name ? `${browserResult.name} ${browserResult.version || ''}`.trim() : 'Unknown Browser';
  const osName = osResult.name ? `${osResult.name} ${osResult.version || ''}`.trim() : 'Unknown OS';

  return {
    deviceType: isMobile ? 'mobile' : 'desktop',
    browser: `${browserName} on ${osName}`.substring(0, 255)
  };
};

const MAX_MOBILE_SESSIONS = 1;
const MAX_DESKTOP_SESSIONS = 2;

const checkDeviceLimits = async (userId: string, deviceType: string, forceLogout: boolean) => {
  const activeSessions = await db.query.refreshTokens.findMany({
    where: and(
      eq(refreshTokens.userId, userId),
      eq(refreshTokens.deviceType, deviceType),
      gt(refreshTokens.expiresAt, new Date())
    ),
    orderBy: (rt, { asc }) => [asc(rt.createdAt)]
  });

  const limit = deviceType === 'mobile' ? MAX_MOBILE_SESSIONS : MAX_DESKTOP_SESSIONS;

  if (activeSessions.length >= limit) {
    if (!forceLogout) {
      return { limitReached: true };
    }
    const sessionsToRemove = activeSessions.slice(0, activeSessions.length - limit + 1);
    for (const session of sessionsToRemove) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, session.id));
    }
  }
  return { limitReached: false };
};

// Helper function for rate limiting
const checkRateLimit = async (ipOrEmail: string, prefix: string) => {
  const key = `ratelimit:${prefix}:${ipOrEmail}`;
  const current = await redisConnection.incr(key);
  if (current === 1) {
    await redisConnection.expire(key, RATE_LIMIT_WINDOW);
  }
  if (current > MAX_REQUESTS) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again later.'
    });
  }
};

export const register = async ({ input, ctx }: { input: any, ctx: any }) => {
  // Rate limit by IP to prevent spamming from the same source
  const ip = getClientIp(ctx.req);
  console.log(ip);
  await checkRateLimit(ip, 'register_ip');

  // Rate limit by email to prevent brute-forcing a specific account
  await checkRateLimit(input.email, 'register_email');

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existingUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User already exists'
    });
  }

  // Check if there's already a pending verification token (optional, but good practice to prevent spamming same email)
  const existingToken = await db.query.verificationTokens.findFirst({ where: eq(verificationTokens.email, input.email) });
  if (existingToken) {
    // We could either delete the old one or just return success and re-send. Let's delete the old one to keep DB clean.
    await db.delete(verificationTokens).where(eq(verificationTokens.email, input.email));
  }

  // Hash password with cost 12
  const hashedPassword = await bcrypt.hash(input.password, 12);

  // Generate Verification Token
  const tokenString = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

  // Hash the token before storing
  const hashedToken = crypto.createHash('sha256').update(tokenString).digest('hex');

  // Insert into pending verification tokens instead of creating user/business immediately
  await db.insert(verificationTokens).values({
    email: input.email,
    token: hashedToken,
    businessName: input.businessName,
    password: hashedPassword,
    expiresAt,
  });

  // Construct Verification Link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl}/verify?token=${tokenString}`;

  // Add Email Job to BullMQ Queue
  await emailQueue.add('send-registration-email', {
    to: input.email,
    subject: 'Verify your Ratehonk Account',
    htmlBody: getRegistrationTemplate(verificationLink, input.businessName)
  });

  return { success: true, message: 'Registration successful. Verification email queued.' };
};

export const verifyRegistration = async ({ input, ctx }: { input: any, ctx: any }) => {
  // Hash the incoming token to check against the DB
  const hashedInputToken = crypto.createHash('sha256').update(input.token).digest('hex');

  // 1. Check Redis for recently verified token
  const cacheKey = `verified:${hashedInputToken}`;
  const cached = await redisConnection.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.token && parsed.refreshToken) {
      ctx.res.cookie('ratehonk_access_token', parsed.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      ctx.res.cookie('ratehonk_refresh_token', parsed.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    }
    return parsed;
  }

  // 2. Find valid token in DB
  const validToken = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.token, hashedInputToken),
      gt(verificationTokens.expiresAt, new Date())
    )
  });

  if (!validToken) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid or expired verification token.'
    });
  }

  // Check if user already got created somehow (race condition)
  let user = await db.query.users.findFirst({ where: eq(users.email, validToken.email) });
  let defaultBusinessId = null;

  if (!user) {
    // 3. Create User NOW
    const [newUser] = await db.insert(users).values({
      email: validToken.email,
      password: validToken.password,
      role: 'ADMIN',
    }).returning();

    // Create Business associated with user
    const [newBusiness] = await db.insert(businesses).values({
      name: validToken.businessName!,
      userId: newUser.id,
    }).returning();

    user = newUser;
    defaultBusinessId = newBusiness.id;
  } else {
    const userBusinesses = await db.query.businesses.findMany({ where: eq(businesses.userId, user.id) });
    defaultBusinessId = userBusinesses.length > 0 ? userBusinesses[0].id : null;
  }

  // 4. Delete the used token
  await db.delete(verificationTokens).where(eq(verificationTokens.id, validToken.id));

  // 5. Generate JWT
  const userAgent = ctx.req?.headers?.['user-agent'] || '';
  const fingerprint = crypto.createHash('sha256').update(userAgent).digest('hex');

  const payload = { userId: user.id, email: user.email, role: user.role, businessId: defaultBusinessId, fingerprint };
  const token = signAccessToken(payload);
  const refreshTokenStr = signRefreshToken(payload);

  const { deviceType, browser } = getDeviceInfo(ctx.req);
  const ip = getClientIp(ctx.req);

  // Check limits
  const deviceCheck = await checkDeviceLimits(user.id, deviceType, input.forceLogout === true);
  if (deviceCheck.limitReached) {
    return {
      success: false,
      requiresLogout: true,
      message: `Maximum device limit reached for ${deviceType}. Do you want to log out the oldest session?`
    };
  }

  // Store refresh token in DB
  await db.insert(refreshTokens).values({
    token: refreshTokenStr,
    userId: user.id,
    deviceType,
    browser,
    ipAddress: ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  const responsePayload = {
    success: true,
    token,
    refreshToken: refreshTokenStr,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      businessId: defaultBusinessId
    },
    message: "Verified successfully"
  };

  // 6. Cache success in Redis for 5 minutes (300 seconds)
  await redisConnection.setex(cacheKey, 300, JSON.stringify(responsePayload));

  // 7. Set HttpOnly Cookies
  ctx.res.cookie('ratehonk_access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 }); // 15 mins
  ctx.res.cookie('ratehonk_refresh_token', refreshTokenStr, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

  return responsePayload;
};

export const login = async ({ input, ctx }: { input: any, ctx: any }) => {
  // Rate limit by IP to prevent brute force attacks from the same source
  const ip = getClientIp(ctx.req);
  await checkRateLimit(ip, 'login_ip');

  // Rate limit by email to prevent brute-forcing a specific account
  await checkRateLimit(input.email, 'login_email');

  // Find user
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (!user || !user.password) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid email or password.'
    });
  }

  // Verify password
  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid email or password.'
    });
  }

  // Find default business for context
  const userBusinesses = await db.query.businesses.findMany({ where: eq(businesses.userId, user.id) });
  const defaultBusinessId = userBusinesses.length > 0 ? userBusinesses[0].id : null;

  // Generate new JWTs
  const userAgent = ctx.req?.headers?.['user-agent'] || '';
  const fingerprint = crypto.createHash('sha256').update(userAgent).digest('hex');
  const payload = { userId: user.id, email: user.email, role: user.role, businessId: defaultBusinessId, fingerprint };
  const token = signAccessToken(payload);
  const refreshTokenStr = signRefreshToken(payload);

  const { deviceType, browser } = getDeviceInfo(ctx.req);

  // Check limits
  const deviceCheck = await checkDeviceLimits(user.id, deviceType, input.forceLogout === true);
  if (deviceCheck.limitReached) {
    return {
      success: false,
      requiresLogout: true,
      message: `Maximum device limit reached for ${deviceType}. Do you want to log out the oldest session?`
    };
  }

  // Determine expiration based on rememberMe flag
  const isRememberMe = input.rememberMe === true;
  const refreshTokenMaxAge = isRememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined; // 30 days or session
  const dbExpiresAt = new Date(Date.now() + (isRememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)); // 30 days or 1 day for safety

  // Store refresh token in DB
  await db.insert(refreshTokens).values({
    token: refreshTokenStr,
    userId: user.id,
    deviceType,
    browser,
    ipAddress: ip,
    expiresAt: dbExpiresAt
  });

  // Set HttpOnly Cookies
  ctx.res.cookie('ratehonk_access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 }); // 15 mins
  ctx.res.cookie('ratehonk_refresh_token', refreshTokenStr, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: refreshTokenMaxAge });

  // Clear rate limits on successful login
  await redisConnection.del(`ratelimit:login_ip:${ip}`);
  await redisConnection.del(`ratelimit:login_email:${input.email}`);

  return {
    success: true,
    token,
    refreshToken: refreshTokenStr,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      businessId: defaultBusinessId
    }
  };
};

export const refreshToken = async ({ ctx }: { ctx: any }) => {
  const incomingRefreshToken = ctx.req?.cookies?.ratehonk_refresh_token;

  if (!incomingRefreshToken) {
    if (ctx.res && typeof ctx.res.clearCookie === 'function') {
      ctx.res.clearCookie('ratehonk_access_token');
      ctx.res.clearCookie('ratehonk_refresh_token');
    }
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No refresh token provided.' });
  }

  const decoded = verifyRefreshToken(incomingRefreshToken) as any;
  if (!decoded) {
    if (ctx.res && typeof ctx.res.clearCookie === 'function') {
      ctx.res.clearCookie('ratehonk_access_token');
      ctx.res.clearCookie('ratehonk_refresh_token');
    }
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token.' });
  }

  // Atomically delete the token to prevent race condition reuse (e.g. from React Strict Mode mounting twice)
  const [deletedToken] = await db.delete(refreshTokens)
    .where(and(
      eq(refreshTokens.token, incomingRefreshToken),
      eq(refreshTokens.userId, decoded.userId)
    ))
    .returning();

  if (!deletedToken || deletedToken.expiresAt < new Date()) {
    if (ctx.res && typeof ctx.res.clearCookie === 'function') {
      ctx.res.clearCookie('ratehonk_access_token');
      ctx.res.clearCookie('ratehonk_refresh_token');
    }
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Refresh token revoked, reused, or expired.' });
  }

  const { deviceType, browser } = getDeviceInfo(ctx.req);
  const ip = getClientIp(ctx.req);

  // Token Theft Detection: Compare incoming device/browser with what's stored in DB
  if (deletedToken.deviceType !== deviceType) {
    // Highly suspicious: same refresh token used from a completely different device type (mobile vs desktop)
    console.warn(`[Security] Token theft detected for user ${decoded.userId}. Revoking all sessions.`);
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, decoded.userId));
    if (ctx.res && typeof ctx.res.clearCookie === 'function') {
      ctx.res.clearCookie('ratehonk_access_token');
      ctx.res.clearCookie('ratehonk_refresh_token');
    }
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Token theft detected! All sessions have been revoked.' });
  }

  const userAgent = ctx.req?.headers?.['user-agent'] || '';
  const fingerprint = crypto.createHash('sha256').update(userAgent).digest('hex');

  const user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    businessId: decoded.businessId,
    fingerprint
  };

  const token = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  // Store new refresh token in DB, carrying over session metadata
  await db.insert(refreshTokens).values({
    token: newRefreshToken,
    userId: user.userId,
    deviceType: deletedToken.deviceType,
    browser: deletedToken.browser,
    ipAddress: deletedToken.ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Set HttpOnly Cookies
  ctx.res.cookie('ratehonk_access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
  ctx.res.cookie('ratehonk_refresh_token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { success: true, token, refreshToken: newRefreshToken, user };
};

export const logout = async ({ ctx }: { ctx: any }) => {
  const incomingRefreshToken = ctx.req?.cookies?.ratehonk_refresh_token;

  if (incomingRefreshToken) {
    // Delete the refresh token from DB to revoke it
    await db.delete(refreshTokens).where(eq(refreshTokens.token, incomingRefreshToken));
  }

  ctx.res.clearCookie('ratehonk_access_token');
  ctx.res.clearCookie('ratehonk_refresh_token');
  return { success: true };
};

export const listSessions = async ({ ctx }: { ctx: any }) => {
  const userId = ctx.user.userId;
  const currentToken = ctx.req?.cookies?.ratehonk_refresh_token;

  const activeSessions = await db.query.refreshTokens.findMany({
    where: and(
      eq(refreshTokens.userId, userId),
      gt(refreshTokens.expiresAt, new Date())
    ),
    orderBy: (rt, { desc }) => [desc(rt.createdAt)]
  });

  const sessions = activeSessions.map(session => ({
    id: session.id,
    deviceType: session.deviceType,
    browser: session.browser,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isCurrentSession: session.token === currentToken
  }));

  return { success: true, sessions };
};

export const revokeSession = async ({ input, ctx }: { input: any, ctx: any }) => {
  const userId = ctx.user.userId;

  // Ensure the session belongs to the user before deleting
  const session = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.id, input.sessionId),
      eq(refreshTokens.userId, userId)
    )
  });

  if (!session) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found or already revoked' });
  }

  await db.delete(refreshTokens).where(eq(refreshTokens.id, session.id));

  return { success: true, message: 'Session revoked successfully' };
};

export const getSession = async ({ ctx }: { ctx: any }) => {
  const userId = ctx.user.userId;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      businesses: true,
      userSubscriptions: {
        with: {
          plan: true
        }
      }
    }
  });

  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
  }

  const { password, ...safeUser } = user;

  return { success: true, user: safeUser };
};
