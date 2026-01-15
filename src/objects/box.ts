import type { Rect, RenderContext, TideEffect, TideObject } from "../interfaces"
import { getColorCode, intersectRect, setCell } from "../util"

export class Box implements TideObject {
  x: number
  y: number
  width: number
  height: number
  color: string
  borderColor: string
  backgroundColor: string
  title: string
  contents: TideObject[]
  zIndex: number
  effects: TideEffect[] = []

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color = "reset",
    borderColor = "reset",
    backgroundColor = "reset",
    title = "",
    zIndex = 0,
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.borderColor = borderColor
    this.backgroundColor = backgroundColor
    this.title = title
    this.contents = []
    this.zIndex = zIndex * 10
  }

  addContent(content: TideObject) {
    this.contents.push(content)
  }

  clear(ctx: RenderContext) {
    const screen = ctx.buffer
    const originX = ctx.origin.x + this.x
    const originY = ctx.origin.y + this.y
    const maxY = Math.min(originY + this.height, screen.length)
    const maxX = Math.min(originX + this.width, screen[0].length)
    const bgColorCode = getColorCode(this.backgroundColor)

    for (let i = originY; i < maxY; i++) {
      for (let j = originX; j < maxX; j++) {
        setCell(
          screen,
          j,
          i,
          `${bgColorCode} \x1b[0m`,
          ctx.clip,
          ctx.dirtyRows
        )
      }
    }
  }

  draw(ctx: RenderContext) {
    const screen = ctx.buffer
    const originX = ctx.origin.x + this.x
    const originY = ctx.origin.y + this.y
    const maxY = Math.min(originY + this.height, screen.length)
    const maxX = Math.min(originX + this.width, screen[0].length)

    if (
      originX >= screen[0].length ||
      originY >= screen.length ||
      maxY <= originY ||
      maxX <= originX
    ) {
      return
    }

    const borderColorCode = getColorCode(this.borderColor)
    const titleColorCode = getColorCode("magenta")
    const bgColorCode = getColorCode(this.backgroundColor)
    const resetCode = "\x1b[0m"

    for (let i = originX + 1; i < maxX - 1; i++) {
      setCell(
        screen,
        i,
        originY,
        `${bgColorCode}${borderColorCode}─${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      )
      setCell(
        screen,
        i,
        maxY - 1,
        `${bgColorCode}${borderColorCode}─${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      )
    }

    for (let i = originY + 1; i < maxY - 1; i++) {
      setCell(
        screen,
        originX,
        i,
        `${bgColorCode}${borderColorCode}│${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      )
      setCell(
        screen,
        maxX - 1,
        i,
        `${bgColorCode}${borderColorCode}│${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      )
    }

    setCell(
      screen,
      originX,
      originY,
      `${bgColorCode}${borderColorCode}┌${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    )
    setCell(
      screen,
      maxX - 1,
      originY,
      `${bgColorCode}${borderColorCode}┐${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    )
    setCell(
      screen,
      originX,
      maxY - 1,
      `${bgColorCode}${borderColorCode}└${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    )
    setCell(
      screen,
      maxX - 1,
      maxY - 1,
      `${bgColorCode}${borderColorCode}┘${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    )

    for (let i = originY + 1; i < maxY - 1; i++) {
      for (let j = originX + 1; j < maxX - 1; j++) {
        setCell(
          screen,
          j,
          i,
          `${bgColorCode} ${resetCode}`,
          ctx.clip,
          ctx.dirtyRows
        )
      }
    }

    if (this.title) {
      const titlePosition = Math.max(
        originX + 2,
        Math.min(maxX - 2 - this.title.length, originX + 2)
      )
      for (
        let i = 0;
        i < this.title.length && titlePosition + i < maxX;
        i++
      ) {
        setCell(
          screen,
          titlePosition + i,
          originY,
          `${bgColorCode}${titleColorCode}${this.title[i]}${resetCode}`,
          ctx.clip,
          ctx.dirtyRows
        )
      }
    }

    for (const effect of this.effects) {
      effect.apply(this, ctx)
    }

    const innerRect: Rect = {
      x: originX + 1,
      y: originY + 1,
      width: Math.max(0, maxX - originX - 2),
      height: Math.max(0, maxY - originY - 2),
    }
    const innerClip = intersectRect(ctx.clip, innerRect)
    if (!innerClip) {
      return
    }
    for (const content of this.contents) {
      content.draw({
        buffer: screen,
        origin: { x: innerRect.x, y: innerRect.y },
        clip: innerClip,
        screenSize: ctx.screenSize,
      })
    }
  }

  addEffect(effect: TideEffect) {
    this.effects.push(effect)
  }

    move(x: number, y: number) {
        this.x += x
        this.y += y
    }
}
