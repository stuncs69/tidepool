import type { RenderContext, TideObject } from "../interfaces";
import { getColorCode, setCell } from "../util";

export class Line implements TideObject {
    relativeX: number;
    relativeY: number;
    length: number;
    color: string;
    zIndex: number;
    
    constructor(x: number, y: number, length: number, color = 'reset', zIndex = 0) {
        this.relativeX = x;
        this.relativeY = y;
        this.length = length;
        this.color = color;
        this.zIndex = zIndex * 10;
    }
    
    draw(ctx: RenderContext) {
        const colorCode = getColorCode(this.color);
        for (let i = 0; i < this.length; i++) {
        const screenX = ctx.origin.x + this.relativeX + i;
        const screenY = ctx.origin.y + this.relativeY;
        setCell(
          ctx.buffer,
          screenX,
          screenY,
          `${colorCode}─\x1b[0m`,
          ctx.clip,
          ctx.dirtyRows
        );
        }
    }
}
