import type { RenderContext, TideEffect, TideObject } from "../interfaces"
import { getColorCode, setCell } from "../util"

export class Shadow implements TideEffect {
  private offset: { x: number; y: number }
  private color: string

  constructor(offsetX = 1, offsetY = 1, color = "gray") {
    this.offset = { x: offsetX, y: offsetY }
    this.color = color
  }

  apply(obj: TideObject, ctx: RenderContext) {
    if (this.isBoxLike(obj)) {
      const colorCode = getColorCode(this.color)
      const originX = ctx.origin.x + obj.x
      const originY = ctx.origin.y + obj.y
      const maxY = Math.min(
        originY + obj.height + this.offset.y,
        ctx.buffer.length
      )
      const maxX = Math.min(
        originX + obj.width + this.offset.x,
        ctx.buffer[0].length
      )

      for (let i = originY + this.offset.y; i < maxY; i++) {
        for (let j = originX + this.offset.x; j < maxX; j++) {
          if (ctx.buffer[i][j] === " ") {
            setCell(
              ctx.buffer,
              j,
              i,
              `${colorCode}█\x1b[0m`,
              ctx.clip,
              ctx.dirtyRows
            )
          }
        }
      }
    }
  }

  private isBoxLike(
    obj: TideObject
  ): obj is TideObject & { x: number; y: number; width: number; height: number } {
    return (
      typeof (obj as { x?: unknown }).x === "number" &&
      typeof (obj as { y?: unknown }).y === "number" &&
      typeof (obj as { width?: unknown }).width === "number" &&
      typeof (obj as { height?: unknown }).height === "number"
    )
  }
}
