import type { TideObject, TideEffect } from "../interfaces"
import { getColorCode } from "../util"

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

  clear(screen: string[][]) {
    const maxY = Math.min(this.y + this.height, screen.length)
    const maxX = Math.min(this.x + this.width, screen[0].length)
    const bgColorCode = getColorCode(this.backgroundColor)

    for (let i = this.y; i < maxY; i++) {
      for (let j = this.x; j < maxX; j++) {
        screen[i][j] = `${bgColorCode} \x1b[0m`
      }
    }
  }

  draw(screen: string[][]) {
    const maxY = Math.min(this.y + this.height, screen.length)
    const maxX = Math.min(this.x + this.width, screen[0].length)

    if (this.x >= screen[0].length || this.y >= screen.length || maxY <= this.y || maxX <= this.x) {
      return
    }

    const borderColorCode = getColorCode(this.borderColor)
    const titleColorCode = getColorCode("magenta")
    const bgColorCode = getColorCode(this.backgroundColor)
    const resetCode = "\x1b[0m"

    for (let i = this.x + 1; i < maxX - 1; i++) {
      screen[this.y][i] = `${bgColorCode}${borderColorCode}─${resetCode}`
      screen[maxY - 1][i] = `${bgColorCode}${borderColorCode}─${resetCode}`
    }

    for (let i = this.y + 1; i < maxY - 1; i++) {
      screen[i][this.x] = `${bgColorCode}${borderColorCode}│${resetCode}`
      screen[i][maxX - 1] = `${bgColorCode}${borderColorCode}│${resetCode}`
    }

    screen[this.y][this.x] = `${bgColorCode}${borderColorCode}┌${resetCode}`
    screen[this.y][maxX - 1] = `${bgColorCode}${borderColorCode}┐${resetCode}`
    screen[maxY - 1][this.x] = `${bgColorCode}${borderColorCode}└${resetCode}`
    screen[maxY - 1][maxX - 1] = `${bgColorCode}${borderColorCode}┘${resetCode}`

    for (let i = this.y + 1; i < maxY - 1; i++) {
      for (let j = this.x + 1; j < maxX - 1; j++) {
        screen[i][j] = `${bgColorCode} ${resetCode}`
      }
    }

    if (this.title) {
      const titlePosition = Math.max(this.x + 2, Math.min(maxX - 2 - this.title.length, this.x + 2))
      for (let i = 0; i < this.title.length && titlePosition + i < maxX; i++) {
        screen[this.y][titlePosition + i] = `${bgColorCode}${titleColorCode}${this.title[i]}${resetCode}`
      }
    }

    for (const effect of this.effects) {
      effect.apply(this, screen)
    }

    for (const content of this.contents) {
      content.draw(screen, this.x + 1, this.y + 1, maxX - this.x - 2)
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
