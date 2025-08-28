import { integer, pgTable, boolean, varchar, date, serial, timestamp } from 'drizzle-orm/pg-core'
// import { addresses } from "./address.schema";
// import { roles } from "./role.schema";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  verify: boolean('verify').default(false),
  name: varchar('name', { length: 100 }).notNull(),
  lastname: varchar('lastname', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  dni: integer('dni').unique().notNull(),
  lastLogin: timestamp('last_login'),
  imageProfile: varchar('image_profile', { length: 255 }),
  aadmission: date('admission').defaultNow(),
  phone: varchar('phone', { length: 20 }),
  state: boolean('state').default(true),
  //   addressId: integer("address_id").references(() => addresses.id),
  //   roleId: integer("role_id").references(() => roles.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
