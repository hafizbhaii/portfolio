import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const content = sqliteTable('portfolio_content', { id: integer('id').primaryKey(), version: integer('version').notNull().default(0), data: text('data').notNull(), updatedAt: integer('updated_at').notNull() });
export const sessions = sqliteTable('editor_sessions', { tokenHash: text('token_hash').primaryKey(), expires: integer('expires').notNull() });
export const attempts = sqliteTable('login_attempts', { key: text('key').primaryKey(), count: integer('count').notNull().default(0), expires: integer('expires').notNull() });
