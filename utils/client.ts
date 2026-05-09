import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import { info } from "@postfmly/logger"
import { stopLogoServer } from "@postfmly/logoserver"

import { closeDatabase } from "./db.ts"
import { RUNNING, stopQuotes } from "./loadQuotes.ts"

let CLIENT: Client | null = null
const TEST_CLIENT: Client | null = null

let isShutdown: boolean = false

const EVENTS: string[] = [
  "SIGINT",
  "SIGTERM"
]

const shutdown = async (event: string): Promise<void> => {
  if (isShutdown) {
    return
  }

  if (Bun.env.DEBUG) {
    info(`${event} detected`)
  }

  info("Shutting down...")

  isShutdown = true

  await closeDatabase()
    .then(async (): Promise<void> => {
      if (RUNNING) {
        await stopQuotes()
      }
    })
    .then(async (): Promise<void> => await Promise.resolve(CLIENT?.destroy()))
    .then(async (): Promise<void> => await stopLogoServer())
    .then((): void => process.exit(0))
}

const client = async (): Promise<Client> => {
  CLIENT = new Client({
    intents: [
      GatewayIntentBits.Guilds
    ],
    presence: {
      activities: [
        {
          name: "Quoting...",
          type: ActivityType.Custom
        }
      ]
    }
  })

  EVENTS.forEach((event: string): void => {
    process.on(event, async (event: string): Promise<void> => {
      await shutdown(event)
    })
  })

  return CLIENT
}

const login = async (): Promise<Client> => {
  CLIENT = TEST_CLIENT ?? CLIENT

  if (!CLIENT) {
    throw new Error("Invalid CLIENT")
  }

  if (!Bun.env.TOKEN) {
    throw new Error("Invalid TOKEN")
  }

  await CLIENT.login(Bun.env.TOKEN)

  if (CLIENT.user && Bun.env.DEBUG) {
    info(`Connected as ${CLIENT.user.displayName} (${CLIENT.user.tag})`)
  }

  return CLIENT
}

export { client, login, shutdown, TEST_CLIENT }
