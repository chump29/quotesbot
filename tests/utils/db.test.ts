import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Channel, type ChannelManager, type Client } from "discord.js"

import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  for await (const file of glob(join(env.DB_PATH, `${env.DB_NAME}*`))) {
    await unlink(file)
  }
})

describe("db", (): void => {
  test("load", (): void => {
    expect(
      DB.load({
        channels: {
          fetch: jest.fn().mockResolvedValue({} as unknown as Channel)
        } as unknown as ChannelManager
      } as Client)
    ).resolves.toBe(undefined)

    const TIMES: number = 10
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)
  })
})
