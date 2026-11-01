import { beforeAll, describe, expect, mock, spyOn, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type Channel, ChannelType, type ChatInputCommandInteraction, type Client, type TextChannel } from "discord.js"

import { env } from "../../utils/env.ts"
import { Quotes } from "../../utils/quotes.ts"

const infoSpy = spyOn(console, "info")
if (!env.TEST_FULL) {
  infoSpy.mockImplementation((): void => undefined)
}

beforeAll(async (): Promise<void> => {
  const mockSend = mock<TextChannel["send"]>()

  await Quotes.init(
    createMock<Client>({
      channels: {
        fetch: createMock<Channel>({
          send: mockSend,
          type: ChannelType.GuildText
        })
      }
    })
  )
})

describe("distraction", (): void => {
  // biome-ignore lint/nursery/useLowercaseTestTitle: getter name
  test("COUNT", (): void => {
    expect(Quotes.COUNT).toBeGreaterThan(0)
  })

  test("show", (): void => {
    const [mockDeferReply, mockEditReply] = [
      mock<ChatInputCommandInteraction["deferReply"]>(),
      mock<ChatInputCommandInteraction["editReply"]>()
    ]

    expect(
      Quotes.show(
        createMock<ChatInputCommandInteraction>({
          createdTimestamp: fake.date.past().getTime(),
          deferReply: mockDeferReply,
          editReply: mockEditReply
        })
      )
    ).resolves.toBe(undefined)

    expect(mockDeferReply).toHaveBeenCalledOnce()
    expect(mockEditReply).toHaveBeenCalledOnce()

    const payload = mockEditReply.mock.calls[0]?.[0]
    if (!payload || typeof payload !== "object") {
      throw new Error("Payload not found")
    }

    let content = ""
    if ("content" in payload && typeof payload.content === "string") {
      ;({ content } = payload)
    }

    expect(content.length).toBeGreaterThan(0)

    const TIMES = 4
    expect(infoSpy).toHaveBeenCalledTimes(TIMES)

    expect(infoSpy).toHaveBeenNthCalledWith(2, expect.any(String), expect.stringContaining(Quotes.COUNT.toString()))
  })
})
