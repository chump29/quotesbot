import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const quotes = sqliteTable("quotes", {
  author: text().notNull(),
  id: integer().primaryKey(),
  quote: text().notNull().unique()
})

type IQuote = Omit<typeof quotes.$inferSelect, "id">

export { type IQuote, quotes }
