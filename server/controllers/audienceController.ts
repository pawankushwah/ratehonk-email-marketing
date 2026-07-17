import { db } from "../db";
import { audienceContacts, tags, contactTags } from "../db/schema";
import { eq, inArray, and } from "drizzle-orm";

export const getAudienceContacts = async ({ businessId }: { businessId: string }) => {
    try {
        const contacts = await db.query.audienceContacts.findMany({
            where: eq(audienceContacts.businessId, businessId),
            orderBy: (audienceContacts, { desc }) => [desc(audienceContacts.createdAt)],
            with: {
                contactTags: {
                    with: {
                        tag: true
                    }
                }
            }
        });

        // Flatten tags structure for easier frontend consumption
        const formattedContacts = contacts.map(c => ({
            ...c,
            tags: c.contactTags.map((ct: any) => ({
                id: ct.tag.id,
                name: ct.tag.name
            }))
        }));

        return { success: true, contacts: formattedContacts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const addAudienceContact = async ({
    businessId, email, firstName, lastName, address, phoneNumber, birthday, company, selectedTagIds, source, subscriptionStatus, updateExisting
}: {
    businessId: string, email: string, firstName?: string, lastName?: string, address?: any, phoneNumber?: string, birthday?: string, company?: string, selectedTagIds?: string[], source?: string, subscriptionStatus?: string, updateExisting?: boolean
}) => {
    try {
        let contactId = '';
        
        const existing = await db.query.audienceContacts.findFirst({
            where: and(eq(audienceContacts.email, email), eq(audienceContacts.businessId, businessId))
        });

        if (existing) {
            if (!updateExisting) {
                return { success: false, error: "Contact with this email already exists." };
            }
            // Update existing contact
            const [updatedContact] = await db.update(audienceContacts).set({
                firstName: firstName ?? existing.firstName,
                lastName: lastName ?? existing.lastName,
                address: address ?? existing.address,
                phoneNumber: phoneNumber ?? existing.phoneNumber,
                birthday: birthday ?? existing.birthday,
                company: company ?? existing.company,
                source: source ?? existing.source,
                subscriptionStatus: subscriptionStatus ?? existing.subscriptionStatus,
                updatedAt: new Date()
            }).where(eq(audienceContacts.id, existing.id)).returning();
            
            contactId = updatedContact.id;

            // Clear existing tags to recreate them
            await db.delete(contactTags).where(eq(contactTags.contactId, contactId));
        } else {
            // Insert new contact
            const [newContact] = await db.insert(audienceContacts).values({
                businessId,
                email,
                firstName,
                lastName,
                address,
                phoneNumber,
                birthday,
                company,
                source: source || 'Manual',
                subscriptionStatus: subscriptionStatus || 'Subscribed',
            }).returning();
            
            contactId = newContact.id;
        }

        // Add tags
        if (selectedTagIds && selectedTagIds.length > 0) {
            const tagInserts = selectedTagIds.map(tagId => ({
                contactId,
                tagId
            }));
            await db.insert(contactTags).values(tagInserts);
        }

        return { success: true, message: existing ? "Contact updated successfully" : "Contact added successfully" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const importAudienceContacts = async ({
    businessId,
    contacts,
    selectedTagIds,
    status,
    updateExisting
}: {
    businessId: string;
    contacts: Array<{
        email: string;
        firstName?: string;
        lastName?: string;
        address?: any;
        phoneNumber?: string;
        birthday?: string;
        company?: string;
    }>;
    selectedTagIds?: string[];
    tags?: string[];
    status?: string;
    updateExisting?: boolean;
}) => {
    try {
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        await db.transaction(async (tx) => {
            for (const contact of contacts) {
                if (!contact.email) continue;
                
                const existing = await tx.query.audienceContacts.findFirst({
                    where: and(eq(audienceContacts.email, contact.email), eq(audienceContacts.businessId, businessId))
                });

                let contactId = '';

                if (existing) {
                    if (!updateExisting) {
                        skippedCount++;
                        continue;
                    }
                    
                    const [updated] = await tx.update(audienceContacts).set({
                        firstName: contact.firstName ?? existing.firstName,
                        lastName: contact.lastName ?? existing.lastName,
                        address: contact.address ?? existing.address,
                        phoneNumber: contact.phoneNumber ?? existing.phoneNumber,
                        birthday: contact.birthday ?? existing.birthday,
                        company: contact.company ?? existing.company,
                        subscriptionStatus: status ?? existing.subscriptionStatus,
                        source: 'Import',
                        updatedAt: new Date()
                    }).where(eq(audienceContacts.id, existing.id)).returning();
                    
                    contactId = updated.id;
                    updatedCount++;
                } else {
                    const [inserted] = await tx.insert(audienceContacts).values({
                        businessId,
                        email: contact.email,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        address: contact.address,
                        phoneNumber: contact.phoneNumber,
                        birthday: contact.birthday,
                        company: contact.company,
                        subscriptionStatus: status || 'Subscribed',
                        source: 'Import'
                    }).returning();
                    
                    contactId = inserted.id;
                    importedCount++;
                }

                let finalTagIds: string[] = [...(selectedTagIds || [])];

                // Process string tags
                if (tags && tags.length > 0) {
                    for (const tagName of tags) {
                        const tName = tagName.trim();
                        if (!tName) continue;
                        
                        let existingTag = await tx.query.tags.findFirst({
                            where: and(eq(tags.name, tName), eq(tags.businessId, businessId))
                        });

                        if (!existingTag) {
                            const [newTag] = await tx.insert(tags).values({
                                businessId,
                                name: tName
                            }).returning();
                            existingTag = newTag;
                        }

                        if (!finalTagIds.includes(existingTag.id)) {
                            finalTagIds.push(existingTag.id);
                        }
                    }
                }

                if (finalTagIds.length > 0) {
                    const existingContactTags = await tx.query.contactTags.findMany({
                        where: eq(contactTags.contactId, contactId)
                    });
                    const existingTagIds = new Set(existingContactTags.map(t => t.tagId));
                    
                    const tagsToInsert = finalTagIds
                        .filter(tid => !existingTagIds.has(tid))
                        .map(tagId => ({ contactId, tagId }));
                        
                    if (tagsToInsert.length > 0) {
                        await tx.insert(contactTags).values(tagsToInsert);
                    }
                }
            }
        });

        return { success: true, importedCount, updatedCount, skippedCount, message: `Import complete. ${importedCount} added, ${updatedCount} updated, ${skippedCount} skipped.` };
    } catch (error: any) {
        console.error('Import error:', error);
        return { success: false, error: error.message };
    }
};

export const updateAudienceContactStatus = async ({
    businessId, contactIds, status
}: {
    businessId: string, contactIds: string[], status: string
}) => {
    try {
        await db.update(audienceContacts)
            .set({ subscriptionStatus: status, updatedAt: new Date() })
            .where(and(inArray(audienceContacts.id, contactIds), eq(audienceContacts.businessId, businessId)));
        
        return { success: true, message: `Status updated to ${status}` };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const deleteAudienceContacts = async ({
    businessId, contactIds
}: {
    businessId: string, contactIds: string[]
}) => {
    try {
        await db.delete(audienceContacts)
            .where(and(inArray(audienceContacts.id, contactIds), eq(audienceContacts.businessId, businessId)));
        return { success: true, message: "Contacts deleted successfully." };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
