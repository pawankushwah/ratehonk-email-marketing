import { db } from '../db';
import { emailTemplates } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { generateHTMLFromPrompt } from '../services/geminiService';

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  htmlContent: string;
  updatedAt: string;
}

const SYSTEM_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Welcome Email',
    category: 'Onboarding',
    description: 'A warm welcome template with standard greeting placeholders and call-to-action button.',
    htmlContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Welcome Onboard!</h2></div>',
    updatedAt: '2026-07-15T10:00:00.000Z'
  },
  {
    id: 'tpl-2',
    name: 'Monthly Newsletter',
    category: 'Update',
    description: 'A clean layout designed for product announcements and article features.',
    htmlContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Monthly Update</h2></div>',
    updatedAt: '2026-07-14T12:30:00.000Z'
  },
  {
    id: 'tpl-3',
    name: 'Summer Sale Promotion',
    category: 'Marketing',
    description: 'An eye-catching visual layout focused on discounts, coupon codes, and conversions.',
    htmlContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Summer Sale!</h2></div>',
    updatedAt: '2026-07-10T09:15:00.000Z'
  },
  {
    id: 'tpl-4',
    name: 'Feedback Survey',
    category: 'Feedback',
    description: 'A simple, direct message prompting subscribers to review their experience.',
    htmlContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Give Feedback</h2></div>',
    updatedAt: '2026-07-08T15:45:00.000Z'
  }
];

export const getEmailTemplates = async ({ businessId }: { businessId: string }) => {
  try {
    const dbTemplates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.businessId, businessId))
      .orderBy(desc(emailTemplates.createdAt));

    const userTemplatesMapped: EmailTemplate[] = dbTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category || 'General',
      description: t.description || '',
      htmlContent: t.htmlContent,
      updatedAt: t.updatedAt.toISOString(),
    }));

    const allTemplates = [...userTemplatesMapped, ...SYSTEM_TEMPLATES];
    return { success: true, templates: allTemplates };
  } catch (error: any) {
    console.error('[emailtempController] Error fetching templates from DB:', error);
    // Fall back to returning default system templates so UI doesn't completely crash
    return { success: true, templates: SYSTEM_TEMPLATES };
  }
};

export const createEmailTemplate = async ({
  businessId,
  name,
  category,
  description,
  htmlContent
}: {
  businessId: string;
  name: string;
  category?: string;
  description?: string;
  htmlContent: string;
}) => {
  try {
    const [newTpl] = await db
      .insert(emailTemplates)
      .values({
        businessId,
        name,
        category: category || 'General',
        description: description || '',
        htmlContent,
      })
      .returning();

    return {
      success: true,
      template: {
        id: newTpl.id,
        name: newTpl.name,
        category: newTpl.category || 'General',
        description: newTpl.description || '',
        htmlContent: newTpl.htmlContent,
        updatedAt: newTpl.updatedAt.toISOString(),
      }
    };
  } catch (error: any) {
    console.error('[emailtempController] Error creating template:', error);
    throw new Error(error.message || 'Failed to create email template');
  }
};

export const generateEmailTemplate = async ({ prompt }: { prompt: string }) => {
  try {
    const html = await generateHTMLFromPrompt(prompt);
    return { success: true, html };
  } catch (error: any) {
    console.error('[emailtempController] Error generating email template:', error);
    
    // Map specific Gemini errors to clean user-facing messages
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable in your .env file.');
    }
    
    // Check for Google GenAI specific issue codes or status messages
    if (error.status === 401 || error.status === 403 || error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Authentication failed: Invalid Gemini API key.');
    } else if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('Rate limit') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Rate limit or quota exceeded: Please check your Gemini billing details or try again in a few moments.');
    } else if (error.status === 503 || error.code === 'ETIMEDOUT') {
      throw new Error('Gemini service is temporarily overloaded or timed out. Please try again.');
    }
    
    throw new Error(error.message || 'An unexpected error occurred during email generation.');
  }
};

export const getTemplateById = async ({ id, businessId }: { id: string; businessId: string }) => {
  try {
    if (id.startsWith('tpl-')) {
      const systemTpl = SYSTEM_TEMPLATES.find((t) => t.id === id);
      if (systemTpl) {
        return {
          success: true,
          template: systemTpl,
        };
      }
    }

    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.businessId, businessId)))
      .limit(1);

    if (!template) {
      throw new Error('Template not found');
    }

    return {
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category || 'General',
        description: template.description || '',
        htmlContent: template.htmlContent,
        updatedAt: template.updatedAt.toISOString(),
      }
    };
  } catch (error: any) {
    console.error('[emailtempController] Error fetching template by ID:', error);
    throw new Error(error.message || 'Failed to fetch email template');
  }
};

export const updateEmailTemplate = async ({
  id,
  businessId,
  name,
  category,
  description,
  htmlContent
}: {
  id: string;
  businessId: string;
  name: string;
  category?: string;
  description?: string;
  htmlContent: string;
}) => {
  try {
    const [updatedTpl] = await db
      .update(emailTemplates)
      .set({
        name,
        category: category || 'General',
        description: description || '',
        htmlContent,
        updatedAt: new Date(),
      })
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.businessId, businessId)))
      .returning();

    if (!updatedTpl) {
      throw new Error('Template not found or not owned by this business');
    }

    return {
      success: true,
      template: {
        id: updatedTpl.id,
        name: updatedTpl.name,
        category: updatedTpl.category || 'General',
        description: updatedTpl.description || '',
        htmlContent: updatedTpl.htmlContent,
        updatedAt: updatedTpl.updatedAt.toISOString(),
      }
    };
  } catch (error: any) {
    console.error('[emailtempController] Error updating template:', error);
    throw new Error(error.message || 'Failed to update email template');
  }
};

export const deleteEmailTemplate = async ({
  id,
  businessId
}: {
  id: string;
  businessId: string;
}) => {
  try {
    const [deletedTpl] = await db
      .delete(emailTemplates)
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.businessId, businessId)))
      .returning();

    if (!deletedTpl) {
      throw new Error('Template not found or not owned by this business');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[emailtempController] Error deleting template:', error);
    throw new Error(error.message || 'Failed to delete email template');
  }
};
