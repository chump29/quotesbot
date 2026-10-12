import { join } from "node:path"

import { error, info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { default as csvToJson } from "convert-csv-to-json"
import { type Channel, type ChatInputCommandInteraction, type Client, MessageFlags, type TextChannel } from "discord.js"
import { CronExpressionBuilder, CronExpressionDescriber, SCHEDULES } from "natural-cron"
import { match } from "ts-pattern"
import { exhaustiveUniqueRandom } from "unique-random"

import { type IQuote } from "../db/schema.ts"
import { env } from "./env.ts"

interface IQuotesBot {
  readonly COUNT: number
  init: (client: Client) => Promise<IQuote[]>
  show: (interaction?: ChatInputCommandInteraction) => Promise<void>
}

class QuotesBot implements IQuotesBot {
  private QUOTES: IQuote[] = []

  private random!: ReturnType<typeof exhaustiveUniqueRandom>

  private CHANNEL!: TextChannel

  get COUNT(): number {
    return this.QUOTES.length
  }

  // * /quote
  async show(interaction?: ChatInputCommandInteraction): Promise<void> {
    if (interaction) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    }

    const quote: Optional<IQuote> = this.QUOTES[this.random()]
    if (!quote) {
      if (interaction) {
        await interaction.editReply({ content: "-# > ❌ Something went wrong" })
      }

      error("❌ Could not get quote")

      return
    }

    await this.CHANNEL.send({
      content: `-# > "${quote.quote}" — ${quote.author}`,
      flags: MessageFlags.SuppressNotifications
    })

    if (interaction) {
      await interaction.editReply({ content: "-# > 💬 Generated new quote" })
    }
  }

  async init(client: Client): Promise<IQuote[]> {
    this.QUOTES = (await csvToJson
      .supportQuotedField(true)
      .getJsonFromCsvAsync(join(env.DB_PATH, "quotes.csv"))) as IQuote[]

    if (this.COUNT === 0) {
      throw new Error("No quotes found")
    }

    this.random = exhaustiveUniqueRandom(0, this.COUNT - 1)

    if (env.DEBUG) {
      info(`ℹ️  Found ${pluralize("quote", this.COUNT, true)}`)
    }

    const channel: Nullable<Channel> = await client.channels.fetch(env.CHANNEL_ID)
    if (!channel) {
      throw new Error("Could not get channel")
    }

    this.CHANNEL = channel as TextChannel

    const time: string = match<string, string>(env.TIMEOUT)
      .with("@hourly", (): string => SCHEDULES.EVERY_HOUR)
      .with("@daily", (): string => SCHEDULES.EVERY_DAY_AT_MIDNIGHT)
      .otherwise((s: string): string => new CronExpressionBuilder().everyX(Number(s), "hour").compile())

    Bun.cron(time, (): Promise<void> => this.show())

    if (env.DEBUG) {
      info(`🕒 Runs: ${CronExpressionDescriber.describe(time)}`)
    }

    return this.QUOTES
  }
}

const Quotes: IQuotesBot = new QuotesBot()

export { Quotes }
