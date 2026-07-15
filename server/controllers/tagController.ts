import { db } from "../db";
import { tags } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const getTags = async ({ businessId }: { businessId: string }) => {
    try {
        const businessTags = await db.query.tags.findMany({
            where: eq(tags.businessId, businessId),
            orderBy: (tags, { asc }) => [asc(tags.name)],
        });
        return { success: true, tags: businessTags };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const addTag = async ({
    businessId, name
}: {
    businessId: string, name: string
}) => {
    try {
        const existing = await db.query.tags.findFirst({
            where: and(eq(tags.name, name), eq(tags.businessId, businessId))
        });

        if (existing) {
            return { success: true, tag: existing };
        }

        const [newTag] = await db.insert(tags).values({
            businessId,
            name
        }).returning();

        return { success: true, tag: newTag };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
