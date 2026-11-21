import { readdir } from "node:fs/promises"
import { join, parse } from "node:path"

import { info } from "@postfmly/logger"

import { type Client, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

import { env } from "../utils/env.ts"
import { cache, type ICommand } from "./cache.ts"

export const invoke = async (client: Client<true>): Promise<void> => {
  const commands = (await readdir(join(import.meta.dir, "commands"))).filter((file: string): boolean =>
    file.endsWith(".ts")
  )

  const commandsArray = await Promise.all(
    commands.map(async (command: string): Promise<RESTPostAPIChatInputApplicationCommandsJSONBody> => {
      const file: ICommand = await import(join(import.meta.dir, "commands", command))
      const data = file.create()

      cache.set(data.name, file)

      if (env.DEBUG) {
        info(`🔨 Loaded /${parse(command).name} command`)
      }

      return data
    })
  )

  await client.application.commands.set(commandsArray)
}
