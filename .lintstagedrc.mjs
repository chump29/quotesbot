import { defineConfig } from "lint-staged/config"

export default defineConfig({
  "*": "bun run --bun cspell --dot --no-must-find-files",
  "*.{json,md,ts,yaml}": "bun run --bun biome ci --no-errors-on-unmatched --error-on-warnings",
  "*.csv": (files) => files.map((file) => `bun run --bun csval "${file}" csval.json`)
})
