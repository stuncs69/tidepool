export type ColorName =
  | "reset"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "transparent"
  | "random";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderContext {
  buffer: string[][];
  origin: Point;
  clip: Rect;
  screenSize: { width: number; height: number };
  dirtyRows?: Set<number>;
}

export interface KeyInfo {
  name?: string;
  sequence?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
}

export interface Focusable {
  zIndex: number;
  contains(x: number, y: number): boolean;
  focus(): void;
  blur(): void;
  handleKey(input: string, key: KeyInfo): boolean;
  handleClick(x: number, y: number): boolean;
}

export interface TideObject {
  zIndex: number;
  draw(ctx: RenderContext): void;
}

export interface TideEffect {
  apply(target: TideObject, ctx: RenderContext): void;
}
