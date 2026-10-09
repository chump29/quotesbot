import { afterAll, beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Channel, type ChannelManager, type ChatInputCommandInteraction, type Client } from "discord.js"

import { Quotes } from "../../utils/quotes.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  await Quotes.init({
    channels: {
      fetch: jest.fn().mockResolvedValue({
        send: jest.fn().mockResolvedValue(undefined)
      } as unknown as Channel)
    } as unknown as ChannelManager
  } as Client)
})

afterAll((): void => {
  Quotes.stopCron()
})

describe("distraction", (): void => {
  test("COUNT", (): void => {
    expect(Quotes.COUNT).toBeGreaterThan(0)
  })

  test("show", (): void => {
    const interaction: ChatInputCommandInteraction = {
      deferReply: jest.fn().mockResolvedValue(undefined),
      editReply: jest.fn().mockResolvedValue(undefined)
    } as unknown as ChatInputCommandInteraction

    expect(Quotes.show(interaction)).resolves.toBe(undefined)

    const mockEditReply = interaction.editReply as ReturnType<typeof jest.fn>
    const firstCallArgs = mockEditReply.mock.calls
    const payload = firstCallArgs[0]?.[0]
    if (!payload) {
      throw new Error("Payload not found")
    }

    expect(mockEditReply).toHaveBeenCalled()
    expect(payload.content.length).toBeGreaterThan(0)

    const TIMES: number = 4
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)
  })
})
