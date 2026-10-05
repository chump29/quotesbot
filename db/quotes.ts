

import { join } from "node:path"

import { info } from "@postfmly/logger"

import { default as pluralize } from "@jarrodek/pluralize"
import { default as csvToJson } from "convert-csv-to-json"

import { type IQuote, quotes } from "../db/schema.ts"
import { DB } from "../utils/db.ts"
import { env } from "../utils/env.ts";

const allQuotes: IQuote[] = await csvToJson
  .supportQuotedField(true)
  .getJsonFromCsvAsync(join(env.DB_PATH, "quotes.csv"))

if (allQuotes.length === 0) {
  throw new Error("No quotes found")
}

DB.open()

if (!DB._db) {
  throw new Error("Database not open")
}

if (await DB._db.$count(quotes)) {
  await DB._db.delete(quotes)

  info("ℹ️  Truncated table")
}

const rows: IQuote[] = await DB._db.insert(quotes).values(allQuotes).returning()

info(`✅ Inserted ${pluralize("row", rows.length, true)}`)

DB.close()
