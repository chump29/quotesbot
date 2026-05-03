// biome-ignore-all lint/suspicious/noExplicitAny: can log anything
import { styleText } from "node:util"

import { format } from "date-and-time"

const getTime = (): string => {
  return (
    styleText("cyan", " [") + styleText("white", format(new Date(), "MM/DD/YYYY @ HH:mm:ss")) + styleText("cyan", "] ")
  )
}

const error = (...objs: any[]): void => {
  if (!objs.length) {
    return
  }

  console.error(
    styleText(
      [
        "bgRed",
        "white"
      ],
      " ERROR "
    ) + getTime()
  )
  objs.forEach((obj: any): void => console.error(styleText("red", " ⤷"), obj))
}

const info = (...objs: any[]): void => {
  if (!objs.length) {
    return
  }

  console.info(
    styleText(
      [
        "bgBlue",
        "white"
      ],
      " INFO "
    ) + getTime()
  )
  objs.forEach((obj: any): void => console.info(styleText("cyan", " ⤷"), obj))
}

export { error, info }
