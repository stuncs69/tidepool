import { TideObject } from "../interfaces";
import { getColorCode, wrapText } from "../util";

export class Text implements TideObject {
    relativeX: number;
    relativeY: number;
    text: string;
    color: string;
    zIndex: number;
    
    constructor(x: number, y: number, text: string, color = 'reset', zIndex = 0) {
      this.relativeX = x;
      this.relativeY = y;
      this.text = text;
      this.color = color;
      this.zIndex = zIndex;
    }
  
    draw(screen: string[][], boxX: number, boxY: number, boxWidth: number) {
      const colorCode = getColorCode(this.color);
      const lines = wrapText(this.text, boxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
          const screenX = boxX + this.relativeX + j;
          const screenY = boxY + this.relativeY + i;
          if (screenX < screen[0].length && screenY < screen.length) {
            screen[screenY][screenX] = `${colorCode}${line[j]}\x1b[0m`;
          }
        }
      }
    }
  }