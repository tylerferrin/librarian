import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { PedalName, PedalState } from '@librarian/plate';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const presets = pgTable('presets', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  pedalName: text('pedal_name').notNull().$type<PedalName>(),
  description: text('description'),
  parameters: jsonb('parameters').notNull().$type<PedalState>(),
  tags: text('tags')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  isFavorite: boolean('is_favorite').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const pedalBanks = pgTable(
  'pedal_banks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    pedalName: text('pedal_name').notNull().$type<PedalName>(),
    bankNumber: integer('bank_number').notNull(),
    presetId: text('preset_id').references(() => presets.id, {
      onDelete: 'set null',
    }),
    syncedAt: timestamp('synced_at'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.pedalName, t.bankNumber] }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Preset = typeof presets.$inferSelect;
export type NewPreset = typeof presets.$inferInsert;
export type PedalBank = typeof pedalBanks.$inferSelect;
export type NewPedalBank = typeof pedalBanks.$inferInsert;
