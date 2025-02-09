import type { TideObject, TideEffect } from "../interfaces";
import { getColorCode } from "../util";

export class Button implements TideObject {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  textColor: string;
  backgroundColor: string;
  zIndex: number;
  effects: TideEffect[] = [];

  constructor(
    zIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    textColor = "white",
    backgroundColor = "blue"
  ) {
    this.zIndex = zIndex * 10;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.textColor = textColor;
    this.backgroundColor = backgroundColor;
  }

  draw(screen: string[][]) {
    const textColorCode = getColorCode(this.textColor);
    const bgColorCode = getColorCode(this.backgroundColor);
    const resetCode = "\x1b[0m";

    // Fill the button area with background-colored spaces
    for (let i = this.y; i < this.y + this.height; i++) {
      for (let j = this.x; j < this.x + this.width; j++) {
        screen[i][j] = `${bgColorCode} ${resetCode}`;
      }
    }

    // Pad the text with one space on each side.
    const paddedText = " " + this.text + " ";

    // Calculate the starting x position for centered text.
    // Make sure we center the padded text, not the original text.
    const textStart = this.x + Math.floor((this.width - paddedText.length) / 2);
    const textRow = this.y + Math.floor(this.height / 2);

    // Draw the padded text onto the screen.
    for (
      let i = 0;
      i < paddedText.length && textStart + i < this.x + this.width;
      i++
    ) {
      screen[textRow][
        textStart + i
      ] = `${bgColorCode}${textColorCode}${paddedText[i]}${resetCode}`;
    }
  }
}
