// biome-ignore-all lint/nursery/useLowercaseTestTitle: using env names

import { describe, expect, test } from "bun:test"

import { type HexColorString } from "discord.js"
import { expectTypeOf } from "expect-type"

import { env } from "../../utils/env.ts"

describe("env", (): void => {
  test("ACTIVITY", (): void => {
    expect(env.ACTIVITY).toBeString()

    expect(env.ACTIVITY.length).toBeGreaterThan(0)
  })

  test("CHANNEL_ID", (): void => {
    expect(env.CHANNEL_ID).toBeString()

    expect(env.CHANNEL_ID.length).toBeGreaterThan(0)
  })

  test("COLOR", (): void => {
    expectTypeOf(env.COLOR).toEqualTypeOf<HexColorString>()

    const LEN = 7

    expect(env.COLOR).toHaveLength(LEN)
  })

  test("DEBUG", (): void => {
    expect(env.DEBUG).toBeBoolean()

    expect(env.DEBUG).toBeTrue()
  })

  test("LOGO_NAME", (): void => {
    expect(env.LOGO_NAME).toBeString()

    expect(env.LOGO_NAME.length).toBeGreaterThan(0)
  })

  test("LOGO_PATH", (): void => {
    expect(env.LOGO_PATH).toBeString()

    expect(env.LOGO_PATH.length).toBeGreaterThan(0)
  })

  test("LOGO_PORT", (): void => {
    expectTypeOf(env.LOGO_PORT).toEqualTypeOf<number | "random">()

    expect(env.LOGO_PORT).toBe("random")
  })

  test("LOGO_URL", (): void => {
    expect(env.LOGO_URL).toBeString()

    expect(env.LOGO_URL.length).toBeGreaterThan(0)
  })

  test("NAME", (): void => {
    expect(env.NAME).toBeString()

    expect(env.NAME.length).toBeGreaterThan(0)
  })

  test("TEST_FULL", (): void => {
    expect(env.TEST_FULL).toBeBoolean()
  })

  test("TIMEOUT", (): void => {
    expect(env.TIMEOUT).toBeString()

    expect(env.TIMEOUT.length).toBeGreaterThan(0)
  })

  test("TOKEN", (): void => {
    expect(env.TOKEN).toBeString()

    expect(env.TOKEN.length).toBeGreaterThan(0)
  })
})
