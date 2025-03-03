import { bigint, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { createId } from 'm3-stack/helpers'
import { user } from './auth'

export * from './auth'

export const reservation = pgTable('reservation', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId(20)),
    course: text('course').notNull(),
    place: text('place').notNull(),
    inventoryUserName: text('inventory_user_name').notNull(),
    inventoryUserEmail: text('inventory_user_email').notNull(),
    inventoryUserId: integer('inventory_user_id').notNull(),
    localUserId: text('user_id')
        .notNull()
        .references(() => user.id),
    from: bigint('from', { mode: 'number' }).notNull(),
    to: bigint('to', { mode: 'number' }).notNull(),
    notebooksQuantity: integer('notebooks_quantity').notNull(),
    notes: text('notes'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: bigint('created_at', { mode: 'number' })
        .notNull()
        .$defaultFn(() => Date.now()),
})
