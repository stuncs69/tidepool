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
        const maxY = Math.min(this.y + this.height, screen.length);
        const maxX = Math.min(this.x + this.width, screen[0].length);

        for (let i = this.y; i < maxY; i++) {
            for (let j = this.x; j < maxX; j++) {
                screen[i][j] = ' ';
            }
        }
    }

    draw(screen: string[][]) {
        const maxY = Math.min(this.y + this.height, screen.length);
        const maxX = Math.min(this.x + this.width, screen[0].length);

        if (this.x >= screen[0].length || this.y >= screen.length || maxY <= this.y || maxX <= this.x) {
            return;
        }

        this.clear(screen);

        const colorCode = getColorCode(this.color);
        const titleColorCode = getColorCode('magenta');

        for (let i = this.x + 1; i < maxX - 1; i++) {
            screen[this.y][i] = `${colorCode}─\x1b[0m`;
        }
        for (let i = this.x + 1; i < maxX - 1; i++) {
            screen[maxY - 1][i] = `${colorCode}─\x1b[0m`;
        }
        for (let i = this.y + 1; i < maxY - 1; i++) {
            screen[i][this.x] = `${colorCode}│\x1b[0m`;
            screen[i][maxX - 1] = `${colorCode}│\x1b[0m`;
        }

        screen[this.y][this.x] = `${colorCode}┌\x1b[0m`;
        screen[this.y][maxX - 1] = `${colorCode}┐\x1b[0m`;
        screen[maxY - 1][this.x] = `${colorCode}└\x1b[0m`;
        screen[maxY - 1][maxX - 1] = `${colorCode}┘\x1b[0m`;

        if (this.title) {
            const titlePosition = Math.max(this.x + 2, Math.min(maxX - 2 - this.title.length, this.x + 2));
            for (let i = 0; i < this.title.length && titlePosition + i < maxX; i++) {
                screen[this.y][titlePosition + i] = `${titleColorCode}${this.title[i]}\x1b[0m`;
            }
        }

        for (const content of this.contents) {
            content.draw(screen, this.x + 1, this.y + 1, maxX - this.x - 2);
        }
    }

    move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
      }
}
