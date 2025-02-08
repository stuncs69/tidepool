import type { TideObject } from "./interfaces";

export class TideScreen {
  width: number;
  height: number;
  frontBuffer: string[][];
  backBuffer: string[][];
  components: TideObject[];
  fps: number | null = null;
  updateFunction: (() => void) | null = null;
  backgroundColor: string;

  constructor(width: number, height: number, backgroundColor = "transparent") {
    this.width = width;
    this.height = height;
    this.frontBuffer = Array.from({ length: height }, () =>
      Array(width).fill(" ")
    );
    this.backBuffer = Array.from({ length: height }, () =>
      Array(width).fill(" ")
    );
    this.components = [];
    this.backgroundColor = backgroundColor;
  }

  clearBuffer(buffer: string[][]) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        buffer[i][j] = " ";
      }
    }
  }

  addComponent(component: TideObject) {
    this.components.push(component);
  }

  private getBackgroundColorCode(color: string): string {
    const colors: { [key: string]: string } = {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      cyan: "\x1b[46m",
      white: "\x1b[47m",
      transparent: "\x1b[49m",
      random: "\x1b[48;5;" + Math.floor(Math.random() * 256) + "m",
    };

    return colors[color.toLowerCase()] || colors["black"];
  }

  private renderBuffer() {
    this.clearBuffer(this.backBuffer);
    this.components.sort((a, b) => b.zIndex - a.zIndex);
    this.components.forEach((component) => component.draw(this.backBuffer));
  }

  applyBackgroundColor() {
    const bgColorCode = this.getBackgroundColorCode(this.backgroundColor);
    const resetCode = "\x1b[0m";
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.backBuffer[i][j] = `${bgColorCode}${
          this.backBuffer[i][j] || " "
        }${resetCode}`;
      }
    }
  }

  private render() {
    this.applyBackgroundColor();

    process.stdout.write("\x1b[H");

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.backBuffer[i][j] !== this.frontBuffer[i][j]) {
          process.stdout.write(`\x1b[${i + 1};${j + 1}H`);
          process.stdout.write(this.backBuffer[i][j]);
          this.frontBuffer[i][j] = this.backBuffer[i][j];
        }
      }
    }
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

  renderCycle(beforeRender?: () => void, afterRender?: () => void) {
    if (this.fps === null) {
      throw new Error("FPS must be set before starting the render cycle.");
    }

    const interval = 1000 / this.fps;

    const loop = () => {
      if (this.updateFunction) {
        this.updateFunction();
      }
      if (beforeRender) {
        beforeRender();
      }
      this.renderBuffer();
      this.render();
      if (afterRender) {
        afterRender();
      }
      setTimeout(loop, interval);
    };

    loop();

    process.on("SIGINT", () => {
      process.stdout.write("\x1b[?25h");
      process.exit();
    });
  }
}
