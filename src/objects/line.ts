import { TideObject } from "../interfaces";
import { getColorCode } from "../util";

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
        this.zIndex = zIndex;
    }
    
    draw(screen: string[][], boxX: number, boxY: number) {
        const colorCode = getColorCode(this.color);
        for (let i = 0; i < this.length; i++) {
        const screenX = boxX + this.relativeX + i;
        const screenY = boxY + this.relativeY;
        if (screenX < screen[0].length && screenY < screen.length) {
            screen[screenY][screenX] = `${colorCode}─\x1b[0m`;
        }
        }
    }
}