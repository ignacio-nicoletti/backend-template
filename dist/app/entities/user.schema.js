'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.users = void 0
const pg_core_1 = require('drizzle-orm/pg-core')
// import { addresses } from "./address.schema";
// import { roles } from "./role.schema";
exports.users = (0, pg_core_1.pgTable)('users', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  verify: (0, pg_core_1.boolean)('verify').default(false),
  name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
  lastname: (0, pg_core_1.varchar)('lastname', { length: 100 }).notNull(),
  email: (0, pg_core_1.varchar)('email', { length: 255 }).unique().notNull(),
  password: (0, pg_core_1.varchar)('password', { length: 255 }).notNull(),
  dni: (0, pg_core_1.integer)('dni').unique().notNull(),
  lastLogin: (0, pg_core_1.timestamp)('last_login'),
  imageProfile: (0, pg_core_1.varchar)('image_profile', { length: 255 }),
  aadmission: (0, pg_core_1.date)('admission').defaultNow(),
  phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
  state: (0, pg_core_1.boolean)('state').default(true),
  //   addressId: integer("address_id").references(() => addresses.id),
  //   roleId: integer("role_id").references(() => roles.id),
  createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
  updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
})
