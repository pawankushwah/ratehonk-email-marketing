import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { 
  getAudienceContacts, 
  addAudienceContact, 
  importAudienceContacts,
  updateAudienceContactStatus, 
  deleteAudienceContacts 
} from '../controllers/audienceController';

export const audienceRouter = router({
  getContacts: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      const result = await getAudienceContacts({ businessId: input.businessId });
      return { ...result, timestamp: new Date().toISOString() };
    }),

  addContact: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid(),
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      address: z.any().optional(),
      phoneNumber: z.string().optional(),
      birthday: z.string().optional(),
      company: z.string().optional(),
      selectedTagIds: z.array(z.string().uuid()).optional(),
      source: z.string().optional(),
      subscriptionStatus: z.string().optional(),
      updateExisting: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const result = await addAudienceContact(input);
      return { ...result, timestamp: new Date().toISOString() };
    }),

  importContacts: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid(),
      contacts: z.array(z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        address: z.any().optional(),
        phoneNumber: z.string().optional(),
        birthday: z.string().optional(),
        company: z.string().optional()
      })),
      selectedTagIds: z.array(z.string().uuid()).optional(),
      tags: z.array(z.string()).optional(),
      status: z.string().optional(),
      updateExisting: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const result = await importAudienceContacts(input);
      return { ...result, timestamp: new Date().toISOString() };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid(),
      contactIds: z.array(z.string().uuid()),
      status: z.enum(['Subscribed', 'Unsubscribed', 'Non-subscribed', 'Pending', 'Cleaned'])
    }))
    .mutation(async ({ input }) => {
      const result = await updateAudienceContactStatus(input);
      return { ...result, timestamp: new Date().toISOString() };
    }),

  deleteContacts: protectedProcedure
    .input(z.object({
      businessId: z.string().uuid(),
      contactIds: z.array(z.string().uuid())
    }))
    .mutation(async ({ input }) => {
      const result = await deleteAudienceContacts(input);
      return { ...result, timestamp: new Date().toISOString() };
    })
});
