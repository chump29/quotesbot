import { error, info } from "@postfmly/logger"

import { init, shutdown } from "./utils/client.ts"
import { DB } from "./utils/db.ts"
import { env } from "./utils/env.ts"

try {
  DB.open()

  await DB.init(await init())

  info(`🟢 ${env.ACTIVITY}....`)
} catch (e: unknown) {
  error(e)

  await shutdown()
}
