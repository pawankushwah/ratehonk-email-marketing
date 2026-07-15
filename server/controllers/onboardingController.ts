import { db } from '../db';
import { businesses, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const updateProfile = async ({ input }: { input: any }) => {
  await db.update(users)
    .set({
      firstName: input.firstName,
      lastName: input.lastName,
      updatedAt: new Date()
    })
    .where(eq(users.id, input.userId));
    
  return { success: true };
};

export const importBrand = async ({ input }: { input: any }) => {
  // In a real scenario, this is where we would scrape the URL using cheerio.
  // For now, we just save the provided data or fallback logo URL.
  
  await db.update(businesses)
    .set({ 
      websiteUrl: input.websiteUrl || null,
      logoUrl: input.logoUrl || null,
      updatedAt: new Date()
    })
    .where(eq(businesses.id, input.businessId));
    
  return { success: true };
};

export const saveContacts = async ({ input }: { input: any }) => {
  await db.update(businesses)
    .set({ 
      contactCount: input.contactCount,
      updatedAt: new Date()
    })
    .where(eq(businesses.id, input.businessId));
    
  return { success: true };
};

export const completeOnboarding = async ({ input }: { input: any }) => {
  await db.update(businesses)
    .set({ 
      onboardingCompleted: 'true',
      updatedAt: new Date()
    })
    .where(eq(businesses.id, input.businessId));
    
  return { success: true };
};
