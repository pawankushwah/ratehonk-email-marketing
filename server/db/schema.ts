import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const rolesEnum = pgEnum('roles', ['SUPERADMIN', 'ADMIN', 'MEMBER']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  contactNumber: text('contact_number'),
  countryCode: text('country_code').default('US'),
  profilePictureUrl: text('profile_picture_url'),
  password: text('password'), // nullable for oauth
  role: rolesEnum('role').notNull().default('MEMBER'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  businesses: many(businesses),
  apiKeys: many(apiKeys),
  userSubscriptions: one(userSubscriptions),
}));

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  description: text('description'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  contactCountryCode: text('contact_country_code'),
  bannerUrl: text('banner_url'),
  contactCount: text('contact_count'),
  onboardingCompleted: text('onboarding_completed').default('false'), // SQLite/PG compat
  userId: uuid('user_id').references(() => users.id).notNull(), // One-to-many relationship (User -> Businesses)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const businessesRelations = relations(businesses, ({ one }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
}));

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  monthlyPrice: integer('monthly_price').notNull().default(0),
  emailLimit: integer('email_limit').notNull().default(0),
  contactLimit: integer('contact_limit').notNull().default(0),
  dailyEmailLimit: integer('daily_email_limit').notNull().default(0),
  templatesAllowed: text('templates_allowed').notNull().default('basic'),
  modules: jsonb('modules').default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  planId: uuid('plan_id').references(() => subscriptionPlans.id).notNull(),
  status: text('status').notNull().default('active'),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const verificationTokens = pgTable('verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  businessName: text('business_name'),
  password: text('password'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  deviceType: text('device_type').notNull().default('desktop'),
  browser: text('browser'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const contactRequests = pgTable('contact_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const domainVerifications = pgTable('domain_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id), // Added to link domain to a business (tenant)
  domain: text('domain').notNull(),
  verificationToken: text('verification_token'), // Added to prevent domain hijacking
  status: text('status').notNull().default('pending'), // 'pending' | 'verified'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const audienceContacts = pgTable('audience_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  address: jsonb('address'),
  phoneNumber: text('phone_number'),
  birthday: text('birthday'),
  company: text('company'),
  source: text('source').default('Manual'),
  rating: integer('rating').default(2),
  subscriptionStatus: text('subscription_status').notNull().default('Subscribed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const contactTags = pgTable('contact_tags', {
  contactId: uuid('contact_id').references(() => audienceContacts.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
});

export const audienceContactsRelations = relations(audienceContacts, ({ many }) => ({
  contactTags: many(contactTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  contactTags: many(contactTags),
}));

export const contactTagsRelations = relations(contactTags, ({ one }) => ({
  contact: one(audienceContacts, {
    fields: [contactTags.contactId],
    references: [audienceContacts.id],
  }),
  tag: one(tags, {
    fields: [contactTags.tagId],
    references: [tags.id],
  }),
}));

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').notNull(),
  name: text('name'),
  key: text('key').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  name: text('name').notNull(),
  category: text('category').default('General'),
  description: text('description'),
  htmlContent: text('html_content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  business: one(businesses, {
    fields: [emailTemplates.businessId],
    references: [businesses.id],
  }),
}));
