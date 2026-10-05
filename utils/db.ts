import { join } from "node:path"

import { Database } from "bun:sqlite"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { default as csvToJson } from "convert-csv-to-json"
import { type Channel, type Client } from "discord.js"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { CronExpressionBuilder, CronExpressionDescriber, SCHEDULES } from "natural-cron"
import { match } from "ts-pattern"

import { type IQuote, quotes } from "../db/schema.ts"
import { env } from "./env.ts"
import { showQuote } from "./quote.ts"

type DBType = ReturnType<typeof drizzle>

interface IQuotesBotDatabase {
  _db: Nullable<DBType>
  _job: Nullable<Bun.CronJob>
  COUNT: number
  close: () => void
  getQuote: () => Promise<IQuote>
  init: (client: Client) => Promise<void>
  open: () => void
}

class QuotesBotDatabase implements IQuotesBotDatabase {
  private client: Nullable<Database> = null
  _db: Nullable<DBType> = null

  COUNT: number = 0

  _job: Nullable<Bun.CronJob> = null

  open(): void {
    if (this._db && env.DEBUG) {
      info("⚠️  Database already open")

      return
    }

    const dbPathName: string = join(env.DB_PATH, env.DB_NAME)

    this.client = new Database(dbPathName, {
      create: true,
      strict: true
    })

    this.client.run(`
      PRAGMA busy_timeout = 3000;
      PRAGMA foreign_keys = 0;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA wal_checkpoint(TRUNCATE);
    `)

    this._db = drizzle({
      client: this.client,
      jit: true
    })

    migrate(this._db, {
      migrationsFolder: env.DB_PATH
    })

    if (env.DEBUG) {
      info(`▶️  Using database: ${dbPathName}`)
    }
  }

  close(): void {
    if (!this._db && env.DEBUG) {
      info("⚠️  Database already closed")
    }

    this.client?.close()
    this.client = null

    this._job?.stop()
    this._job = null

    this._db = null

    if (env.DEBUG) {
      info("⏹️  Database closed")
    }
  }

  private dbCheck(): DBType {
    if (!this._db) {
      throw new Error("Database not open")
    }

    return this._db
  }

  private async load(): Promise<void> {
    const allQuotes: IQuote[] = (await csvToJson
      .supportQuotedField(true)
      .getJsonFromCsvAsync(join(env.DB_PATH, "quotes.csv"))) as IQuote[]

    if (allQuotes.length === 0) {
      throw new Error("No quotes found")
    }

    if ((await this.dbCheck().$count(quotes)) !== allQuotes.length) {
      await this.dbCheck().delete(quotes)

      await this.dbCheck().insert(quotes).values(allQuotes).returning()

      if (env.DEBUG) {
        info(`✅ Inserted ${pluralize("quote", allQuotes.length, true)}`)
      }
    }
  }

  async init(client: Client): Promise<void> {
    await this.load()

    this.COUNT = await this.dbCheck().$count(quotes)

    if (env.DEBUG) {
      info(`ℹ️  Found ${pluralize("quote", this.COUNT, true)}`)
    }

    const channel: Nullable<Channel> = await client.channels.fetch(env.CHANNEL_ID)
    if (!channel) {
      throw new Error("Could not get channel")
    }

    const time: string = match<string, string>(env.TIMEOUT)
      .with("@hourly", (): string => SCHEDULES.EVERY_HOUR)
      .with("@daily", (): string => SCHEDULES.EVERY_DAY_AT_MIDNIGHT)
      .otherwise((s: string): string => new CronExpressionBuilder().everyX(Number(s), "hour").compile())

    this._job = Bun.cron(time, async (): Promise<void> => {
      await showQuote(channel, await DB.getQuote())
    })

    if (env.DEBUG) {
      info(`🕒 Runs: ${CronExpressionDescriber.describe(time)}`)
    }
  }

  // * /quote
  async getQuote(): Promise<IQuote> {
    const [quote]: IQuote[] = await this.dbCheck()
      .select({ author: quotes.author, quote: quotes.quote })
      .from(quotes)
      .orderBy(sql`RANDOM()`)
      .limit(1)

    if (!quote) {
      throw new Error("Could not get quote")
    }

    return quote
  }
}

const DB: IQuotesBotDatabase = new QuotesBotDatabase()

export { DB }
