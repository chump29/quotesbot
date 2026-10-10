import { glob, unlink } from "node:fs/promises"
import { join } from "node:path"

import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Channel, type ChannelManager, type Client } from "discord.js"

import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

let infoSpy: jest.Mock

const path: string = join(env.DB_PATH, env.DB_NAME)

beforeAll(async (): Promise<void> => {
  infoSpy = spyOn(console, "info").mockImplementation((): void => undefined) // suppress

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

    const TIMES: number = 10
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)

    expect(infoSpy).toHaveBeenNthCalledWith(2, expect.any(String), expect.stringContaining(path))
  })
})
