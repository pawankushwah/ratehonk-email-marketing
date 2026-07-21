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

    const allTemplates = [...userTemplatesMapped];
    return { success: true, templates: allTemplates };
  } catch (error: any) {
    console.error('[emailtempController] Error fetching templates from DB:', error);
    // Fall back to returning default system templates so UI doesn't completely crash
    return { success: true, templates: [] };
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

export const generateEmailTemplate = async ({ prompt, userId, provider }: { prompt: string; userId?: string; provider?: string }) => {
  try {
    const { generateContent } = await import('../services/aiService');
    const { EMAIL_TEMPLATE_SYSTEM_PROMPT } = await import('../services/aiInstructions');
    const html = await generateContent(userId, prompt, EMAIL_TEMPLATE_SYSTEM_PROMPT, provider);
    return { success: true, html };
  } catch (error: any) {
    console.error('[emailtempController] Error generating email template:', error);
    if (error.message === 'NO_API_KEY') {
      throw new Error('No active AI provider configured. Please go to Settings > API & Integrations to add and activate an API key.');
    }
    if (error.message === 'NO_API_KEY_FOR_PROVIDER') {
      throw new Error('You do not have an active API key configured for the selected provider. Please go to Settings > API & Integrations to configure it.');
    }
    throw new Error(error.message || 'An unexpected error occurred during email generation.');
  }
};

export const getTemplateById = async ({ id, businessId }: { id: string; businessId: string }) => {
  try {
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

export const duplicateEmailTemplate = async ({
  id,
  businessId
}: {
  id: string;
  businessId: string;
}) => {
  try {
    const existing = await getTemplateById({ id, businessId });
    if (!existing.success || !existing.template) {
      throw new Error('Template not found');
    }

    return await createEmailTemplate({
      businessId,
      name: `${existing.template.name} (Copy)`,
      category: existing.template.category,
      description: existing.template.description,
      htmlContent: existing.template.htmlContent
    });
  } catch (error: any) {
    console.error('[emailtempController] Error duplicating template:', error);
    throw new Error(error.message || 'Failed to duplicate email template');
  }
};
