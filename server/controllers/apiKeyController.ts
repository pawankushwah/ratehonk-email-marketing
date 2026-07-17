import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { apiKeys } from '../db/schema';
import { TRPCError } from '@trpc/server';

export async function getApiKeys({ userId }: { userId: string }) {
  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        provider: apiKeys.provider,
        name: apiKeys.name,
        key: apiKeys.key,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
    return { success: true, apiKeys: keys };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch API keys',
    });
  }
}

export async function createApiKey({
  userId,
  provider,
  name,
  key,
}: {
  userId: string;
  provider: string;
  name?: string;
  key: string;
}) {
  try {
    const existingKeys = await db.select({ id: apiKeys.id }).from(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)));
    const isFirstKey = existingKeys.length === 0;

    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId,
        provider,
        name,
        key,
        isActive: isFirstKey,
      })
      .returning();
    return { success: true, apiKey: newKey };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create API key',
    });
  }
}

export async function updateApiKey({
  id,
  userId,
  name,
  key,
}: {
  id: string;
  userId: string;
  name?: string;
  key?: string;
}) {
  try {
    const updateData: Partial<typeof apiKeys.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updateData.name = name;
    if (key !== undefined) updateData.key = key;

    const [updatedKey] = await db
      .update(apiKeys)
      .set(updateData)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning();

    if (!updatedKey) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'API key not found',
      });
    }

    return { success: true, apiKey: updatedKey };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error('Error updating API key:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update API key',
    });
  }
}

export async function deleteApiKey({ id, userId }: { id: string; userId: string }) {
  try {
    const [deletedKey] = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning();

    if (!deletedKey) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'API key not found',
      });
    }

    return { success: true, deleted: true };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error('Error deleting API key:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete API key',
    });
  }
}

export async function setActiveApiKey({
  userId,
  provider,
  id,
}: {
  userId: string;
  provider: string;
  id: string;
}) {
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(apiKeys)
        .set({ isActive: false })
        .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)));

      await tx
        .update(apiKeys)
        .set({ isActive: true })
        .where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, id)));
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting active API key:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to set active API key',
    });
  }
}

