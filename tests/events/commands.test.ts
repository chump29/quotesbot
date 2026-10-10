import { readdir } from "node:fs/promises"
import { default as path } from "node:path"

import { beforeAll, describe, expect, jest, spyOn, test } from "bun:test"

import { type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import {
  type Channel,
  type ChannelManager,
  type ChatInputCommandInteraction,
  type Client,
  type Guild,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type TextChannel,
  type User
} from "discord.js"
import { match } from "ts-pattern"

import { author, version } from "../../package.json" with { type: "json" }
import { env } from "../../utils/env.ts"
import { Quotes } from "../../utils/quotes.ts"

interface ICommandFile {
  create: () => RESTPostAPIChatInputApplicationCommandsJSONBody
  invoke: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const HEX_BASE: number = 16
const COLOR_LEN: number = 6
const decimalToHex = (c: Optional<number>): string => (c ? `#${c.toString(HEX_BASE).padStart(COLOR_LEN, "0")}` : "N/A")

const dir: string = "events/commands"

const commands: string[] = (await readdir(dir)).filter((file: string): boolean => file.endsWith(".ts"))

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll(async (): Promise<void> => {
  infoSpy.mockReset()

  await Quotes.init({
    channels: {
      fetch: jest.fn().mockResolvedValue({
        send: jest.fn().mockResolvedValue(undefined)
      } as unknown as Channel)
    } as unknown as ChannelManager
  } as Client)
})

await Promise.all(
  commands.map(async (command: string): Promise<void> => {
    const { create, invoke } = (await import(`${path.join("../..", dir)}/${command}`)) satisfies ICommandFile

    const name: string = path.basename(command, ".ts")

    describe(`/${name}`, (): void => {
      test("create", (): void => {
        const c: RESTPostAPIChatInputApplicationCommandsJSONBody = create()

        expect(c.name).toBe(name)
        expect(c.description).not.toBeEmpty()
        expect(c.contexts ?? []).not.toBeEmpty()
      })

      test("invoke", async (): Promise<void> => {
        const interaction: ChatInputCommandInteraction = {
          createdTimestamp: fake.date.past().getTime(),
          deferReply: jest.fn().mockResolvedValue(undefined),
          editReply: jest.fn().mockResolvedValue(undefined),
          guild: {
            channels: {
              fetch: jest.fn().mockResolvedValue({
                send: jest.fn().mockResolvedValue(undefined)
              } as unknown as TextChannel)
            } as unknown as ChannelManager
          } as Guild,
          user: {
            username: fake.internet.username()
          } as User
        } as unknown as ChatInputCommandInteraction

        expect(await invoke(interaction)).toBeUndefined()

        expect(interaction.deferReply).toHaveBeenCalledTimes(1)
        expect(interaction.editReply).toHaveBeenCalledTimes(1)

        const mockEditReply = interaction.editReply as ReturnType<typeof jest.fn>
        const firstCallArgs = mockEditReply.mock.calls
        const payload = firstCallArgs[0]?.[0]
        if (!payload) {
          throw new Error("Payload not found")
        }

        match<string, void>(name)
          .with("info", (): void => {
            const data = payload.embeds?.[0].data

            expect(decimalToHex(data.color)).toBe(env.COLOR)
            expect(data.author.icon_url).toBe(env.LOGO_URL)
            expect(data.author.name).toBe(`${env.NAME} v${version}`)
            expect(data.thumbnail.url).toBe(env.LOGO_URL)
            expect(data.description).not.toBeEmpty()
            expect(data.footer.text).toEndWith(author.name)
          })
          .with("ping", (): void => expect(payload.content).toInclude("Pong"))
          .with("quote", (): void => expect(payload.content).toInclude("Generated"))
          .otherwise((): never => {
            throw new Error(`Payload tests not found for /${name}`)
          })
      })
    })
  })
)
