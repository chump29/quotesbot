import { type Channel, MessageFlags, type TextChannel } from "discord.js"

import { type IQuote } from "../db/schema.ts"

const showQuote = async (channel: Channel, quote: IQuote): Promise<void> => {
  await (channel as TextChannel).send({
    content: `-# > "${quote.quote}" — ${quote.author}`,
    flags: MessageFlags.SuppressNotifications
  })
}

export { showQuote }
