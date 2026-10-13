import { defineConfig } from "lint-staged/config"

export default defineConfig({
  ".env*": "bun run --bun dotenv-linter check",
  "*.{json,ts}": "bun run --bun biome ci --no-errors-on-unmatched --error-on-warnings",
  "*.csv": (files) => files.map((file) => `bun run --bun csval "${file}" csval.json`)
})
