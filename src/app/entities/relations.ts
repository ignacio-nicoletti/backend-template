import { relations } from 'drizzle-orm'
import { users } from './user.schema'

export const usersRelations = relations(users, ({ many, one }) => ({}))
