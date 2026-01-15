import type { Focusable, KeyInfo, RenderContext, TideEffect, TideObject } from "../interfaces";
import { getColorCode, setCell } from "../util";

export interface ButtonOptions {
  onPress?: () => void;
  focusedBackgroundColor?: string;
  focusedTextColor?: string;
}

export class Button implements TideObject, Focusable {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  textColor: string;
  backgroundColor: string;
  zIndex: number;
  effects: TideEffect[] = [];
  isFocused = false;
  onPress?: () => void;
  focusedBackgroundColor: string;
  focusedTextColor: string;

  constructor(
    zIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    textColor = "white",
    backgroundColor = "blue",
    options: ButtonOptions = {}
  ) {
    this.zIndex = zIndex * 10;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.textColor = textColor;
    this.backgroundColor = backgroundColor;
    this.onPress = options.onPress;
    this.focusedBackgroundColor = options.focusedBackgroundColor ?? "white";
    this.focusedTextColor = options.focusedTextColor ?? "black";
  }

  focus() {
    this.isFocused = true;
  }

  blur() {
    this.isFocused = false;
  }

  contains(x: number, y: number) {
    return (
      x >= this.x &&
      y >= this.y &&
      x < this.x + this.width &&
      y < this.y + this.height
    );
  }

  handleClick(_x: number, _y: number) {
    if (this.onPress) {
      this.onPress();
    }
    return true;
  }

  handleKey(_input: string, key: KeyInfo) {
    if (key.name === "return" || key.name === "enter" || key.name === "space") {
      if (this.onPress) {
        this.onPress();
      }
      return true;
    }
    return false;
  }

  draw(ctx: RenderContext) {
    const screen = ctx.buffer;
    const originX = ctx.origin.x + this.x;
    const originY = ctx.origin.y + this.y;
    const activeTextColor = this.isFocused
      ? this.focusedTextColor
      : this.textColor;
    const activeBackground = this.isFocused
      ? this.focusedBackgroundColor
      : this.backgroundColor;
    const textColorCode = getColorCode(activeTextColor);
    const bgColorCode = getColorCode(activeBackground);
    const resetCode = "\x1b[0m";

    // Fill the button area with background-colored spaces
    for (let i = originY; i < originY + this.height; i++) {
      for (let j = originX; j < originX + this.width; j++) {
        setCell(
          screen,
          j,
          i,
          `${bgColorCode} ${resetCode}`,
          ctx.clip,
          ctx.dirtyRows
        );
      }
    }

    // Pad the text with one space on each side.
    const paddedText = " " + this.text + " ";

    // Calculate the starting x position for centered text.
    // Make sure we center the padded text, not the original text.
    const textStart = originX + Math.floor((this.width - paddedText.length) / 2);
    const textRow = originY + Math.floor(this.height / 2);

    // Draw the padded text onto the screen.
    for (
      let i = 0;
      i < paddedText.length && textStart + i < this.x + this.width;
      i++
    ) {
      setCell(
        screen,
        textStart + i,
        textRow,
        `${bgColorCode}${textColorCode}${paddedText[i]}${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
    }
  }
}
