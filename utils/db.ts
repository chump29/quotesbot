import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import ConvertCsvToJson from "convert-csv-to-json"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"
import pluralize from "pluralize"

import { type IQuotes, quotes } from "../db/schema.ts"
import { info } from "./logger.ts"

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null

const loadQuotes = async (): Promise<void> => {
  const allQuotes: IQuotes[] = await ConvertCsvToJson.supportQuotedField(true).getJsonFromCsvAsync(
    `${import.meta.dirname}/quotes.csv`
  )

  if (!allQuotes) {
    throw new Error("Invalid allQuotes")
  }

  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.delete(quotes)

  const rows: IQuotes[] = await DB.insert(quotes).values(allQuotes).returning()

  if (!rows.length) {
    throw new Error("Invalid rows")
  }

  if (Bun.env.DEBUG) {
    info(`Inserted ${pluralize("quote", rows.length, true)}`)
  }
}

const openDatabase = async (): Promise<void> => {
  await mkdir(Bun.env.DB_PATH, {
    recursive: true
  })

  const DB_STR: string = `${Bun.env.DB_PATH}${Bun.env.DB_NAME}`
  SQLITE = new Database(DB_STR, {
    create: true,
    strict: true
  })
  DB = drizzle({
    client: SQLITE,
    jit: true
  })
  DB.run("PRAGMA journal_mode = WAL;")
  DB.run("PRAGMA wal_checkpoint(TRUNCATE);")

  try {
    await DB.select().from(quotes)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message.includes("no such table")) {
      if (Bun.env.DEBUG) {
        info("Creating tables...")
      }

      const table: string = `
      CREATE TABLE quotes(
        id INTEGER PRIMARY KEY,
        quote TEXT NOT NULL UNIQUE,
        author TEXT NOT NULL
      )`
      SQLITE.run(table)

      await loadQuotes()
    } else {
      throw e
    }
  }

  if (Bun.env.DEBUG) {
    info(`Using database: ${DB_STR}`)
  }
}

const getQuotes = async (): Promise<IQuotes[]> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  return await DB.select().from(quotes)
}

const closeDatabase = async (): Promise<void> => {
  SQLITE?.close()
}

export { closeDatabase, getQuotes, loadQuotes, openDatabase }
