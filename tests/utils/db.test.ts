import { default as assert } from "node:assert/strict"
import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { afterAll, beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type Channel, type ChannelManager, type Client } from "discord.js"
import { SCHEDULES } from "natural-cron"
import { match } from "ts-pattern"

import { type IQuote, quotes } from "../../db/schema.ts"
import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

const deleteFiles = async (): Promise<void> => {
  for await (const file of glob(join(env.DB_PATH, `${env.DB_NAME}*`))) {
    await unlink(file)
  }
}

const quote: string = fake.lorem.sentence()
const author: string = fake.person.fullName()

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  await deleteFiles()

  DB.open()

  assert(DB._db)

  await DB._db.insert(quotes).values({ quote, author })

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
  test("COUNT", (): void => {
    expect(DB.COUNT).toBe(1)
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

    expect(q.quote).toBe(quote)
    expect(q.author).toBe(author)
  })
})
