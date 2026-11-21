import { type ChatInputCommandInteraction, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

export interface ICommand {
  create: () => RESTPostAPIChatInputApplicationCommandsJSONBody
  invoke: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export const cache = new Map<string, ICommand>()
