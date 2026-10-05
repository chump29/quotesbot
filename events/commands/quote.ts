import { parse } from "node:path"

import { type Nullable } from "@postfmly/types"

import {
  type Channel,
  type ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"
import { showQuote } from "../../utils/quote.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody =>
  new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Generate new quote")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  if (!interaction.guild) {
    await interaction.editReply({ content: "❌ Could not get guild" })

    return
  }

  const channel: Nullable<Channel> = await interaction.guild.channels.fetch(env.CHANNEL_ID)
  if (!channel) {
    await interaction.editReply({ content: "❌ Could not get channel" })

    return
  }

  await showQuote(channel, await DB.getQuote())

  await interaction.editReply({ content: "-# > 💬 Generated new quote" })
}

export { create, invoke }
