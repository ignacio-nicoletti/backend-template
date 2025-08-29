import { integer, pgTable, boolean, varchar, date, serial, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial().primaryKey(),
  verify: boolean().default(false),
  firstName: varchar({ length: 100 }).notNull(),
  lastName: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  dni: integer().unique().notNull(),
  lastLogin: timestamp(),
  imageProfile: varchar({ length: 255 }),
  admission: date().defaultNow(),
  phone: varchar({ length: 20 }),
  state: boolean().default(true),

  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
})
