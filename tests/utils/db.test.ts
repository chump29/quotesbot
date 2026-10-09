import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Channel, type ChannelManager, type Client } from "discord.js"

import { DB } from "../../utils/db.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll((): void => {
  infoSpy.mockReset()
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

    const TIMES: number = 8
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)
  })
})
