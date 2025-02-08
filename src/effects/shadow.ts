import type { TideEffect, TideObject } from "../interfaces"
import { getColorCode } from "../util"

export class Shadow implements TideEffect {
  private offset: { x: number; y: number }
  private color: string

  constructor(offsetX = 1, offsetY = 1, color = "gray") {
    this.offset = { x: offsetX, y: offsetY }
    this.color = color
  }

  apply(obj: TideObject, screen: string[][]) {
    if ("x" in obj && "y" in obj && "width" in obj && "height" in obj) {
      const colorCode = getColorCode(this.color)
      const maxY = Math.min(obj.y + obj.height + this.offset.y, screen.length)
      const maxX = Math.min(obj.x + obj.width + this.offset.x, screen[0].length)

      for (let i = obj.y + this.offset.y; i < maxY; i++) {
        for (let j = obj.x + this.offset.x; j < maxX; j++) {
          if (i >= 0 && j >= 0 && i < screen.length && j < screen[0].length) {
            if (screen[i][j] === " ") {
              screen[i][j] = `${colorCode}█\x1b[0m`
            }
          }
        }
      }
    }
  }
}

