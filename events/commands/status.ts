import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { RUNNING } from "../../utils/loadQuotes.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription(`${Bun.env.NAME} status`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  let status: string = "stopped"
  if (RUNNING) {
    status = "started"
  }

  await interaction.reply({
    content: `-# > ❌ ${Bun.env.NAME} is ${status}`,
    flags: MessageFlags.Ephemeral
  })
}

export { create, invoke }
