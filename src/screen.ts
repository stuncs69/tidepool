import type { RenderContext, TideObject } from "./interfaces";

export class TideScreen {
  width: number;
  height: number;
  frontBuffer: string[][];
  backBuffer: string[][];
  components: TideObject[];
  fps: number | null = null;
  updateFunction: (() => void) | null = null;
  backgroundColor: string;
  private needsSort = true;
  private resizeListener: (() => void) | null = null;
  private didInitialClear = false;

  constructor(width: number, height: number, backgroundColor = "transparent") {
    this.width = width;
    this.height = height;
    this.frontBuffer = this.createBuffer(width, height);
    this.backBuffer = this.createBuffer(width, height);
    this.components = [];
    this.backgroundColor = backgroundColor;
  }

  private createBuffer(width: number, height: number) {
    return Array.from({ length: height }, () => Array(width).fill(" "));
  }

  clearBuffer(buffer: string[][], dirtyRows?: Set<number>) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        buffer[i][j] = " ";
      }
      if (dirtyRows) {
        dirtyRows.add(i);
      }
    }
  }

  addComponent(component: TideObject) {
    this.components.push(component);
    this.needsSort = true;
  }

  invalidateSort() {
    this.needsSort = true;
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
    const dirtyRows = new Set<number>();
    this.clearBuffer(this.backBuffer, dirtyRows);
    if (this.needsSort) {
      this.components.sort((a, b) => b.zIndex - a.zIndex);
      this.needsSort = false;
    }
    const baseContext: RenderContext = {
      buffer: this.backBuffer,
      origin: { x: 0, y: 0 },
      clip: { x: 0, y: 0, width: this.width, height: this.height },
      screenSize: { width: this.width, height: this.height },
      dirtyRows,
    };
    this.components.forEach((component) => component.draw(baseContext));
    return dirtyRows;
  }

  applyBackgroundColor(dirtyRows?: Set<number>) {
    if (this.backgroundColor.toLowerCase() === "transparent") {
      return;
    }
    const bgColorCode = this.getBackgroundColorCode(this.backgroundColor);
    const resetCode = "\x1b[0m";
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.backBuffer[i][j] = `${bgColorCode}${
          this.backBuffer[i][j] || " "
        }${resetCode}`;
        if (dirtyRows) {
          dirtyRows.add(i);
        }
      }
    }
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.frontBuffer = this.createBuffer(width, height);
    this.backBuffer = this.createBuffer(width, height);
  }

  enableAutoResize(
    getSize: () => { width: number; height: number } = () => ({
      width: process.stdout.columns - 1,
      height: process.stdout.rows - 1,
    })
  ) {
    if (this.resizeListener) {
      return;
    }
    this.resizeListener = () => {
      const size = getSize();
      this.resize(size.width, size.height);
    };
    process.on("SIGWINCH", this.resizeListener);
  }

  disableAutoResize() {
    if (!this.resizeListener) {
      return;
    }
    process.off("SIGWINCH", this.resizeListener);
    this.resizeListener = null;
  }

  private render(dirtyRows?: Set<number>) {
    if (!this.didInitialClear) {
      process.stdout.write("\x1b[2J\x1b[H");
      this.didInitialClear = true;
    }
    this.applyBackgroundColor(dirtyRows);

    process.stdout.write("\x1b[H");

    const rowsToRender =
      dirtyRows && dirtyRows.size > 0
        ? Array.from(dirtyRows)
        : dirtyRows
        ? []
        : Array.from({ length: this.height }, (_, i) => i);

    for (const i of rowsToRender) {
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
    const dirtyRows = this.renderBuffer();
    this.render(dirtyRows);
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
      const dirtyRows = this.renderBuffer();
      this.render(dirtyRows);
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
