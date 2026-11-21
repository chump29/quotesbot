import { join } from "node:path"

import { error } from "@postfmly/logger"

import { type Client, Events, type Interaction, MessageFlags } from "discord.js"

interface IClientReady {
  invoke: (client: Client<true>) => Promise<void>
}

interface IInteractionCreate {
  invoke: (interaction: Interaction) => Promise<void>
}

export const loadCommands = async (client: Client): Promise<void> => {
  const [interactionCreate, clientReady] = await Promise.all<[Promise<IInteractionCreate>, Promise<IClientReady>]>([
    import(join(import.meta.dir, `${Events.InteractionCreate}.ts`)),
    import(join(import.meta.dir, `${Events.ClientReady}.ts`))
  ])

  client.on(Events.InteractionCreate, (interaction: Interaction): void => {
    interactionCreate.invoke(interaction).catch(async (e: unknown): Promise<void> => {
      error(`❌ ${interaction.isCommand() ? interaction.commandName : "Unknown"}:`, e)

      if (!interaction.isRepliable()) {
        return
      }

      const payload = {
        content: "There was an error while executing this command.",
        flags: MessageFlags.Ephemeral
      } as const

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(payload.content)
      } else {
        await interaction.reply(payload)
      }
    })
  })

  client.once(Events.ClientReady, (c: Client<true>): void => {
    clientReady.invoke(c).catch((e: unknown): void => {
      error(`❌ ${Events.ClientReady}:`, e)
    })
  })
}
