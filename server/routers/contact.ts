import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../db';
import { contactRequests } from '../db/schema';
import { emailQueue } from '../queue/emailQueue';
import { getContactAdminTemplate } from '../utils/emailTemplates';

export const contactRouter = router({
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      subject: z.string().optional(),
      message: z.string().min(10, "Message must be at least 10 characters")
    }))
    .mutation(async ({ input }) => {
      // 1. Save to Database
      await db.insert(contactRequests).values({
        name: input.name,
        email: input.email,
        subject: input.subject || null,
        message: input.message,
        status: 'pending'
      });

      // 2. Queue Email to Admin
      // Fallback admin email if not provided in env
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@ratehonk.com';

      await emailQueue.add('send-contact-email', {
        to: adminEmail,
        subject: `New Contact Request: ${input.subject || 'General Inquiry'}`,
        htmlBody: getContactAdminTemplate(input.name, input.email, input.subject || '', input.message)
      });

      return { success: true, message: 'Message sent successfully.' };
    })
});
