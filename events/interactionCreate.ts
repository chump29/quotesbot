import { type Interaction } from "discord.js"

import { cache } from "./cache.ts"

export const invoke = async (interaction: Interaction): Promise<void> => {
  if (!interaction.isChatInputCommand()) {
    return
  }

  const command = cache.get(interaction.commandName)
  if (!command) {
    return
  }

  await command.invoke(interaction)
}
