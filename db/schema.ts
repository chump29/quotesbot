import { type InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const quotes = sqliteTable("quotes", {
  author: text().notNull(),
  id: integer().primaryKey(),
  quote: text().notNull().unique()
})

type IQuote = InferSelectModel<typeof quotes>

export { type IQuote, quotes }
