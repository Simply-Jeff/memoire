import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  metadata: text('metadata').default('{}'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
});

export const bookmarkTags = sqliteTable('bookmark_tags', {
  bookmarkId: integer('bookmark_id').notNull().references(() => bookmarks.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
}, (table) => ({
  pk: uniqueIndex('pk_bookmark_tags').on(table.bookmarkId, table.tagId),
}));
