import { TideObject } from "./interfaces";

export class TideScreen {
    width: number;
    height: number;
    screen: string[][];
    buffer: string[][];
    components: TideObject[];
    fps: number | null = null;
    updateFunction: (() => void) | null = null;
    backgroundColor: string;

    constructor(width: number, height: number, backgroundColor: string = 'transparent') {
        this.width = width;
        this.height = height;
        this.screen = Array.from({ length: height }, () => Array(width).fill(' '));
        this.buffer = Array.from({ length: height }, () => Array(width).fill(' '));
        this.components = [];
        this.backgroundColor = backgroundColor;
    }

    clearScreen() {
        this.screen = Array.from({ length: this.height }, () => Array(this.width).fill(' '));
    }

    clearBuffer() {
        this.buffer = Array.from({ length: this.height }, () => Array(this.width).fill(' '));
    }

    addComponent(component: TideObject) {
        this.components.push(component);
    }

    private getBackgroundColorCode(color: string): string {
        const colors: { [key: string]: string } = {
            black: '\x1b[40m',
            red: '\x1b[41m',
            green: '\x1b[42m',
            yellow: '\x1b[43m',
            blue: '\x1b[44m',
            magenta: '\x1b[45m',
            cyan: '\x1b[46m',
            white: '\x1b[47m',
            transparent: '\x1b[49m',
        };

        return colors[color.toLowerCase()] || colors['black'];
    }

    private renderBuffer() {
        this.clearBuffer();
        this.components.sort((a, b) => b.zIndex - a.zIndex);
        this.components.forEach(component => component.draw(this.buffer));
    }

    applyBackgroundColor() {
        const bgColorCode = this.getBackgroundColorCode(this.backgroundColor);
        const resetCode = '\x1b[0m';
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.buffer[i][j] = `${bgColorCode}${this.buffer[i][j] || ' '}${resetCode}`;
            }
        }
    }

    private render() {
        this.applyBackgroundColor();
        console.clear();
        const output = this.buffer.map(row => row.join('')).join('\n');
        console.log(output);
    }

    setUpdateFunction(fn: () => void) {
        this.updateFunction = fn;
    }

    setFPS(fps: number) {
        this.fps = fps;
    }

    nextFrame() {
        if (this.updateFunction) {
            this.updateFunction();
        }
        this.renderBuffer();
        this.render();
    }

    renderCycle() {
        if (this.fps === null) {
            throw new Error("FPS must be set before starting the render cycle.");
        }

        const interval = 1000 / this.fps;

        const loop = () => {
            if (this.updateFunction) {
                this.updateFunction();
            }
            this.renderBuffer();
            this.render();
            setTimeout(loop, interval);
        };

        loop();
    }
}
