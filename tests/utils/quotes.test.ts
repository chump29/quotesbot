import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Channel, type ChannelManager, type ChatInputCommandInteraction, type Client } from "discord.js"

import { Quotes } from "../../utils/quotes.ts"

let infoSpy: jest.Mock

beforeAll(async (): Promise<void> => {
  infoSpy = spyOn(console, "info").mockImplementation((): void => undefined) // suppress

  await Quotes.init({
    channels: {
      fetch: jest.fn().mockResolvedValue({
        send: jest.fn().mockResolvedValue(undefined)
      } as unknown as Channel)
    } as unknown as ChannelManager
  } as Client)
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

    expect(infoSpy).toHaveBeenNthCalledWith(2, expect.any(String), expect.stringContaining(Quotes.COUNT.toString()))
  })
})
