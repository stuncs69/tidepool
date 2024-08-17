import { TideObject } from "./interfaces";

export class TideScreen {
    width: number;
    height: number;
    screen: string[][];
    buffer: string[][];
    components: TideObject[];
    fps: number | null = null;
    updateFunction: (() => void) | null = null;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.screen = Array.from({ length: height }, () => Array(width).fill(' '));
        this.buffer = Array.from({ length: height }, () => Array(width).fill(' '));
        this.components = [];
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

    renderBuffer() {
        this.clearBuffer();
        this.components.sort((a, b) => b.zIndex - a.zIndex);
        this.components.forEach(component => component.draw(this.buffer));
    }

    render() {
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

    renderCycle() {
        if (this.fps === null) {
            throw new Error("FPS must be set before starting the render cycle.");
        }

        const interval = 1000 / this.fps;

        const loop = () => {
            if (this.updateFunction) {
                this.updateFunction();
            }
            this.renderBuffer(); // Prepare the buffer with updated content
            this.render(); // Output the buffer to the screen
            setTimeout(loop, interval);
        };

        loop();
    }
}
