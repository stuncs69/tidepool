import { TideObject } from "../interfaces";
import { getColorCode } from "../util";

export class Box implements TideObject {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    title: string;
    contents: TideObject[];
    zIndex: number;

    constructor(x: number, y: number, width: number, height: number, color = 'reset', title = '', zIndex = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.title = title;
      this.contents = [];
      this.zIndex = zIndex;
    }
  
    addContent(content: TideObject) {
      this.contents.push(content);
    }
  
    clear(screen: string[][]) {
      for (let i = this.y; i < this.y + this.height; i++) {
        for (let j = this.x; j < this.x + this.width; j++) {
          screen[i][j] = ' ';
        }
      }
    }
  
    draw(screen: string[][]) {
      this.clear(screen);
  
      const colorCode = getColorCode(this.color);
      const titleColorCode = getColorCode('magenta');
  
      for (let i = this.x + 1; i < this.x + this.width - 1; i++) {
        screen[this.y][i] = `${colorCode}─\x1b[0m`;
      }
      for (let i = this.x + 1; i < this.x + this.width - 1; i++) {
        screen[this.y + this.height - 1][i] = `${colorCode}─\x1b[0m`;
      }
      for (let i = this.y + 1; i < this.y + this.height - 1; i++) {
        screen[i][this.x] = `${colorCode}│\x1b[0m`;
        screen[i][this.x + this.width - 1] = `${colorCode}│\x1b[0m`;
      }
  
      screen[this.y][this.x] = `${colorCode}┌\x1b[0m`;
      screen[this.y][this.x + this.width - 1] = `${colorCode}┐\x1b[0m`;
      screen[this.y + this.height - 1][this.x] = `${colorCode}└\x1b[0m`;
      screen[this.y + this.height - 1][this.x + this.width - 1] = `${colorCode}┘\x1b[0m`;
  
      if (this.title) {
        const titlePosition = Math.max(this.x + 2, Math.min(this.x + this.width - 2 - this.title.length, this.x + 2));
        for (let i = 0; i < this.title.length; i++) {
          if (titlePosition + i < screen[0].length && this.y < screen.length) {
            screen[this.y][titlePosition + i] = `${titleColorCode}${this.title[i]}\x1b[0m`;
          }
        }
      }
  
      for (const content of this.contents) {
        content.draw(screen, this.x + 1, this.y + 1, this.width - 2);
      }
    }
  
    move(dx: number, dy: number) {
      this.x += dx;
      this.y += dy;
    }
  }
  