import { type Channel, type Client, MessageFlags, type TextChannel } from "discord.js"

import ms, { type StringValue } from "ms"
import pluralize from "pluralize"

import { type IQuotes } from "../db/schema.ts"
import { getQuotes } from "./db.ts"
import { info } from "./logger.ts"

let CLIENT: Client | null = null
let CHANNEL: TextChannel | null = null

let QUOTES: IQuotes[] = []
let COUNT: number = 0

let RUNNING: boolean = false

let TIMEOUT: number = 0
let ID: NodeJS.Timeout | null = null

const getChannel = async (): Promise<TextChannel> => {
  if (!CLIENT) {
    throw new Error("Invalid client")
  }

  return await CLIENT.channels.fetch(Bun.env.CHANNEL_ID).then((channel: Channel | null) => {
    if (!channel) {
      throw new Error("Invalid channel")
    }

    return channel as TextChannel
  })
}

const refreshQuotes = async (): Promise<void> => {
  QUOTES = await getQuotes()
  COUNT = QUOTES.length
}

const loadSettings = async (client: Client): Promise<void> => {
  if (!client) {
    throw new Error("Invalid client")
  }

  CLIENT = client
  CHANNEL = await getChannel()

  await refreshQuotes()

  TIMEOUT = ms((Bun.env.TIMEOUT || "12h") as StringValue)

  if (Bun.env.DEBUG) {
    info(`Loaded ${COUNT.toLocaleString()} ${pluralize("quote", COUNT)}`)
  }
}

const newQuote = async (): Promise<void> => {
  if (ID) {
    clearTimeout(ID)
  }

  const quote: IQuotes | undefined = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  if (!quote) {
    throw new Error("Invalid quote")
  }

  if (!CHANNEL) {
    throw new Error("Invalid channel")
  }

  await CHANNEL.send({
    content: `-# > "${quote.quote}" — ${quote.author}`,
    flags: MessageFlags.SuppressNotifications
  }).then((): void => {
    ID = setTimeout(newQuote, TIMEOUT)
  })
}

const startQuotes = async (): Promise<void> => {
  await newQuote()

  ID = setTimeout(newQuote, TIMEOUT)

  RUNNING = true

  if (Bun.env.DEBUG) {
    info("Started")
  }
}

const stopQuotes = async (): Promise<void> => {
  if (ID) {
    clearTimeout(ID)
  }

  RUNNING = false

  if (Bun.env.DEBUG) {
    info("Stopped")
  }
}

export { COUNT, loadSettings, newQuote, RUNNING, refreshQuotes, startQuotes, stopQuotes }
