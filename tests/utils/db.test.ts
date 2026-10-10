import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Channel, type ChannelManager, type Client } from "discord.js"

import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

const path: string = join(env.DB_PATH, env.DB_NAME)

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  for await (const file of glob(`${path}*`)) {
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

    const count: number = 10

    expect(infoSpy).toHaveBeenCalledTimes(count)

    expect(infoSpy).toHaveBeenNthCalledWith(2, expect.any(String), expect.stringContaining(path))
  })
})
