import { join } from "node:path"

import { Database } from "bun:sqlite"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { type Client } from "discord.js"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { type IQuote, quotes } from "../db/schema.ts"
import { env } from "./env.ts"
import { Quotes } from "./quotes.ts"

type DBType = ReturnType<typeof drizzle>

interface IQuotesBotDatabase {
  load: (client: Client) => Promise<void>
}

class QuotesBotDatabase implements IQuotesBotDatabase {
  private client: Nullable<Database> = null
  private _db: Nullable<DBType> = null

  private open(): void {
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

  private close(): void {
    if (!this._db && env.DEBUG) {
      info("⚠️  Database already closed")
    }

    this.client?.close()
    this.client = null

    Quotes.stopCron()

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

  async load(client: Client): Promise<void> {
    this.open()

    const allQuotes: IQuote[] = await Quotes.init(client)

    if ((await this.dbCheck().$count(quotes)) !== allQuotes.length) {
      await this.dbCheck().delete(quotes)

      await this.dbCheck().insert(quotes).values(allQuotes)

      if (env.DEBUG) {
        info(`✅ Inserted ${pluralize("quote", allQuotes.length, true)}`)
      }
    }

    this.close()
  }
}

const DB: IQuotesBotDatabase = new QuotesBotDatabase()

export { DB }
