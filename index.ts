import { type Client } from "discord.js"

import { error, info } from "@postfmly/logger"
import { startLogoServer } from "@postfmly/logoserver"

import { loadCommands } from "./events/loadCommands.ts"
import { client, login, shutdown } from "./utils/client.ts"
import { openDatabase } from "./utils/db.ts"
import { loadSettings, startQuotes } from "./utils/loadQuotes.ts"

Bun.env.DEBUG = Bun.env.IS_DEBUG === "true" ? true : false

Bun.env.NAME = Bun.env.NAME ?? "QuotesBot"

await openDatabase()
  .then(async (): Promise<void> => await loadCommands(await client()))
  .then(async (): Promise<Client> => await login())
  .then(async (client: Client): Promise<void> => await loadSettings(client))
  .then(async (): Promise<void> => await startLogoServer())
  .then((): void => info("Running..."))
  .then(async (): Promise<void> => {
    if (Bun.env.AUTOSTART === "true") {
      await startQuotes()
    }
  })
  .catch(async (e: unknown): Promise<void> => {
    error(e)
    await shutdown()
  })
