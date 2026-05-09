import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import { info } from "@postfmly/logger"

import ConvertCsvToJson from "convert-csv-to-json"
import { sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"
import pluralize from "pluralize"

import { type IQuote, quotes } from "../db/schema.ts"

let SQLITE: Database | null = null
let TEST_SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null
const TEST_DB: SQLiteBunDatabase | null = null

Bun.env.DB_NAME = Bun.env.DB_NAME || "quotesbot.db"
Bun.env.DB_PATH = Bun.env.DB_PATH || "./db/"

const loadQuotes = async (): Promise<void> => {
  const allQuotes: IQuote[] = await ConvertCsvToJson.supportQuotedField(true).getJsonFromCsvAsync(
    `${import.meta.dirname}/quotes.csv`
  )

  if (!allQuotes.length) {
    throw new Error("No quotes found")
  }

  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.delete(quotes)

  const rows: IQuote[] = await DB.insert(quotes).values(allQuotes).returning()

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

  if (Bun.env.NODE_ENV === "test") {
    TEST_SQLITE = SQLITE
  }

  DB =
    TEST_DB ??
    drizzle({
      client: SQLITE,
      jit: true
    })
  DB.run(
    sql.raw(`
      PRAGMA journal_mode = WAL;
      PRAGMA wal_checkpoint(TRUNCATE);`)
  )

  try {
    await DB.select().from(quotes)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message.includes("no such table")) {
      if (Bun.env.DEBUG) {
        info("Creating tables")
      }

      DB.run(
        sql.raw(`
          CREATE TABLE quotes(
            id INTEGER PRIMARY KEY,
            quote TEXT NOT NULL UNIQUE,
            author TEXT NOT NULL);`)
      )

      await loadQuotes()
    } else {
      throw e
    }
  }

  if (Bun.env.DEBUG) {
    info(`Using database: ${DB_STR}`)
  }
}

const getQuotes = async (): Promise<IQuote[]> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  return await DB.select().from(quotes)
}

const closeDatabase = async (): Promise<void> => {
  SQLITE?.close()

  if (Bun.env.DEBUG) {
    info("Database closed")
  }
}

export { closeDatabase, getQuotes, loadQuotes, openDatabase, TEST_DB, TEST_SQLITE }
