import type { RenderContext, TideEffect, TideObject } from "../interfaces";
import { getColorCode, setCell, wrapText } from "../util";

export class Text implements TideObject {
  relativeX: number;
  relativeY: number;
  text: string;
  color: string;
  zIndex: number;
  effects: TideEffect[] = [];

  constructor(x: number, y: number, text: string, color = "reset", zIndex = 0) {
    this.relativeX = x;
    this.relativeY = y;
    this.text = text;
    this.color = color;
    this.zIndex = zIndex * 10;
  }

  applyEffect(effect: TideEffect) {
    this.effects.push(effect);
  }

  draw(ctx: RenderContext) {
    const screen = ctx.buffer;
    const colorCode = getColorCode(this.color);
    const maxWidth = Math.max(0, ctx.clip.width);
    const lines = wrapText(this.text, maxWidth);

    for (const effect of this.effects) {
      effect.apply(this, ctx);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const screenX = ctx.origin.x + this.relativeX + j;
        const screenY = ctx.origin.y + this.relativeY + i;
        setCell(
          screen,
          screenX,
          screenY,
          `${colorCode}${line[j]}\x1b[0m`,
          ctx.clip,
          ctx.dirtyRows
        );
      }
    }
  }
}
