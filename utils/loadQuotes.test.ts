import { describe, expect, jest, mock, spyOn, test } from "bun:test"

import { type ChannelManager, type Client, type TextChannel } from "discord.js"

import { fake } from "@nano-faker/patterns"
import { fullName } from "@nano-faker/person"

import { type IQuote } from "../db/schema.ts"
import { COUNT, forTesting, loadSettings, newQuote, RUNNING, startQuotes, stopQuotes } from "./loadQuotes.ts"

describe("loadQuotes", (): void => {
  test("loadSettings", async (): Promise<void> => {
    const quotes: IQuote[] = [
      {
        author: fullName(),
        quote: fake("*".repeat(10))
      } as IQuote
    ] as IQuote[]

    mock.module("./db.ts", (): unknown => {
      return {
        getQuotes: jest.fn().mockResolvedValue(quotes)
      }
    })

    const channel: TextChannel = {
      send: jest.fn().mockResolvedValue(null)
    } as unknown as TextChannel

    const channelManager: ChannelManager = {
      cache: new Map([
        [
          channel.id,
          channel
        ]
      ]),
      fetch: jest.fn().mockResolvedValue(channel)
    } as unknown as ChannelManager

    const client: Client = {
      channels: channelManager
    } as Client

    await loadSettings(client)

    expect(COUNT).toEqual(1)
  })

  test("loadSettings - no client", async (): Promise<void> => {
    // biome-ignore lint/suspicious/noExplicitAny: for testing
    expect(async (): Promise<void> => await loadSettings(null as any)).toThrowError("Invalid client")
  })

  test("newQuote", async (): Promise<void> => {
    mock.module("./loadQuotes.ts", () => {
      return {
        CHANNEL: {} as TextChannel
      }
    })

    const channelSpy: jest.Mock = spyOn(forTesting!, "CHANNEL")

    await newQuote()

    expect(channelSpy).not.toBeNull()
  })

  test("startQuotes", async (): Promise<void> => {
    mock.module("./loadQuotes.ts", (): unknown => {
      return {
        newQuote: jest.fn()
      }
    })

    await startQuotes()

    expect(RUNNING).toBeTrue()
  })

  test("stopQuotes", async (): Promise<void> => {
    await stopQuotes()

    expect(RUNNING).toBeFalse()
  })
})
