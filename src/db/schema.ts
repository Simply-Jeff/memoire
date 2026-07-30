import { sqliteTable, text, integer, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from "next-auth/adapters"

export const users = sqliteTable('users', {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  passwordHash: text('password_hash'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  imageUrl: text('image_url'),
  contentType: text('content_type').default('link'), // 'link', 'article', 'video', 'image', 'product', 'twitter'
  metadata: text('metadata').default('{}'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const bookmarkArchives = sqliteTable('bookmark_archives', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookmarkId: integer('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: "cascade" }),
  format: text('format').notNull(), // 'screenshot', 'pdf', 'readable'
  filePath: text('file_path').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text('name').notNull(),
  token: text('token').notNull().unique(), // Hashed/encrypted in production, plain for simplicity now
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
});

export const bookmarkTags = sqliteTable('bookmark_tags', {
  bookmarkId: integer('bookmark_id').notNull().references(() => bookmarks.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
}, (table) => [
  uniqueIndex('pk_bookmark_tags').on(table.bookmarkId, table.tagId),
]);
