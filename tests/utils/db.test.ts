import { default as assert } from "node:assert/strict"
import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { afterAll, beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { default as csvToJson } from "convert-csv-to-json"
import { type Channel, type ChannelManager, type Client } from "discord.js"
import { SCHEDULES } from "natural-cron"
import { match } from "ts-pattern"

import { type IQuote } from "../../db/schema.ts"
import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

const deleteFiles = async (): Promise<void> => {
  for await (const file of glob(join(env.DB_PATH, `${env.DB_NAME}*`))) {
    await unlink(file)
  }
}

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  await deleteFiles()

  DB.open()

  assert(DB._db)

  await DB.init({
    channels: {
      fetch: jest.fn().mockResolvedValue({
        send: jest.fn().mockResolvedValue(undefined)
      } as unknown as Channel)
    } as unknown as ChannelManager
  } as Client)
})

afterAll(async (): Promise<void> => {
  await deleteFiles()

  DB.close()
})

describe("db", (): void => {
  test("COUNT", async (): Promise<void> => {
    const allQuotes: IQuote[] = (await csvToJson
      .supportQuotedField(true)
      .getJsonFromCsvAsync(join(env.DB_PATH, "quotes.csv"))) as IQuote[]

    expect(DB.COUNT).toBe(allQuotes.length)
  })

  test("Cron", (): void => {
    const cron: string = match<string, string>(env.TIMEOUT)
      .with("@hourly", (): string => SCHEDULES.EVERY_HOUR)
      .with("@daily", (): string => SCHEDULES.EVERY_DAY_AT_MIDNIGHT)
      .otherwise((s: string): string => `0 */${s} * * *`)

    expect(DB._job?.cron).toBe(cron)
  })

  test("getQuote", async (): Promise<void> => {
    const q: IQuote = await DB.getQuote()

    expect(q.quote.length).toBeGreaterThan(0)
    expect(q.author.length).toBeGreaterThan(0)
  })
})
