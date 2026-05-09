import { glob, unlink } from "node:fs/promises"

import { type Database } from "bun:sqlite"
import { afterAll, beforeAll, describe, expect, jest, mock, test } from "bun:test"

import { info } from "@postfmly/logger"

import { fake } from "@nano-faker/patterns"
import { fullName } from "@nano-faker/person"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { EnhancedQueryLogger } from "drizzle-query-logger"

import { type IQuote } from "../db/schema.ts"
import { closeDatabase, getQuotes, openDatabase, TEST_SQLITE } from "./db.ts"

mock.module("./db.ts", (): unknown => {
  return {
    TEST_DB: drizzle({
      client: TEST_SQLITE as Database,
      jit: true,
      logger: Bun.env.DEBUG_SQL === "true" ? new EnhancedQueryLogger() : undefined
    })
  }
})

const author: string = fullName()
const quote: string = fake("*".repeat(10))
mock.module("convert-csv-to-json", (): unknown => {
  return {
    default: {
      getJsonFromCsvAsync: jest.fn().mockResolvedValue([
        {
          author: author,
          quote: quote
        } as IQuote
      ] as IQuote[]),
      supportQuotedField: jest.fn().mockReturnThis()
    }
  }
})

const deleteFiles = async (): Promise<void> => {
  for await (const file of glob(`${Bun.env.DB_PATH}/${Bun.env.DB_NAME}*`)) {
    info(`Deleting ${file}`)
    await unlink(file)
  }
}

beforeAll(async (): Promise<void> => {
  await deleteFiles().then(async (): Promise<void> => await openDatabase())
})

afterAll(async (): Promise<void> => {
  await deleteFiles().then(async (): Promise<void> => {
    await closeDatabase()
  })
})

describe("db", (): void => {
  test("getQuotes", async (): Promise<void> => {
    const quotes: IQuote[] = await getQuotes()
    expect(quotes).not.toBeEmpty()
    expect(quotes.at(0)?.author).toBe(author)
    expect(quotes.at(0)?.quote).toBe(quote)
  })
})
