import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  type InteractionResponse,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import pluralize from "pluralize"

import { loadQuotes } from "../../utils/db.ts"
import { COUNT, refreshQuotes } from "../../utils/loadQuotes.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reload quotes")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await loadQuotes()
    .then(async (): Promise<void> => await refreshQuotes())
    .then(
      async (): Promise<InteractionResponse> =>
        await interaction.reply({
          content: `-# > 🔄 Loaded ${COUNT.toLocaleString()} ${pluralize("quote", COUNT)}`,
          flags: MessageFlags.Ephemeral
        })
    )
}

export { create, invoke }
