import type { Focusable, KeyInfo, RenderContext, TideObject } from "../interfaces";
import { getColorCode, setCell } from "../util";

export interface InputFieldOptions {
  zIndex?: number;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  placeholder?: string;
  placeholderColor?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export class InputField implements TideObject, Focusable {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  zIndex: number;
  isFocused = false;
  cursor = 0;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  placeholder: string;
  placeholderColor: string;
  maxLength: number;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;

  constructor(
    x: number,
    y: number,
    width: number,
    height = 3,
    initialValue = "",
    options: InputFieldOptions = {}
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.value = initialValue;
    this.cursor = initialValue.length;
    this.zIndex = (options.zIndex ?? 0) * 10;
    this.textColor = options.textColor ?? "white";
    this.backgroundColor = options.backgroundColor ?? "reset";
    this.borderColor = options.borderColor ?? "cyan";
    this.placeholder = options.placeholder ?? "";
    this.placeholderColor = options.placeholderColor ?? "gray";
    this.maxLength = options.maxLength ?? 256;
    this.onChange = options.onChange;
    this.onSubmit = options.onSubmit;
  }

  focus() {
    this.isFocused = true;
  }

  blur() {
    this.isFocused = false;
  }

  contains(x: number, y: number) {
    return (
      x >= this.x &&
      y >= this.y &&
      x < this.x + this.width &&
      y < this.y + this.height
    );
  }

  handleClick(_x: number, _y: number) {
    return true;
  }

  handleKey(input: string, key: KeyInfo) {
    if (key.name === "left") {
      this.cursor = Math.max(0, this.cursor - 1);
      return true;
    }
    if (key.name === "right") {
      this.cursor = Math.min(this.value.length, this.cursor + 1);
      return true;
    }
    if (key.name === "home") {
      this.cursor = 0;
      return true;
    }
    if (key.name === "end") {
      this.cursor = this.value.length;
      return true;
    }
    if (key.name === "backspace") {
      if (this.cursor > 0) {
        this.value =
          this.value.slice(0, this.cursor - 1) +
          this.value.slice(this.cursor);
        this.cursor -= 1;
        if (this.onChange) {
          this.onChange(this.value);
        }
      }
      return true;
    }
    if (key.name === "delete") {
      if (this.cursor < this.value.length) {
        this.value =
          this.value.slice(0, this.cursor) + this.value.slice(this.cursor + 1);
        if (this.onChange) {
          this.onChange(this.value);
        }
      }
      return true;
    }
    if (key.name === "return" || key.name === "enter") {
      if (this.onSubmit) {
        this.onSubmit(this.value);
      }
      return true;
    }

    if (input && input.length === 1 && !key.ctrl && !key.meta) {
      if (this.value.length < this.maxLength) {
        this.value =
          this.value.slice(0, this.cursor) +
          input +
          this.value.slice(this.cursor);
        this.cursor += 1;
        if (this.onChange) {
          this.onChange(this.value);
        }
      }
      return true;
    }

    return false;
  }

  draw(ctx: RenderContext) {
    const originX = ctx.origin.x + this.x;
    const originY = ctx.origin.y + this.y;
    const maxX = originX + this.width;
    const maxY = originY + this.height;
    const borderColor = getColorCode(this.borderColor);
    const resetCode = "\x1b[0m";

    for (let x = originX + 1; x < maxX - 1; x++) {
      setCell(
        ctx.buffer,
        x,
        originY,
        `${borderColor}─${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
      setCell(
        ctx.buffer,
        x,
        maxY - 1,
        `${borderColor}─${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
    }

    for (let y = originY + 1; y < maxY - 1; y++) {
      setCell(
        ctx.buffer,
        originX,
        y,
        `${borderColor}│${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
      setCell(
        ctx.buffer,
        maxX - 1,
        y,
        `${borderColor}│${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
    }

    setCell(
      ctx.buffer,
      originX,
      originY,
      `${borderColor}┌${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    );
    setCell(
      ctx.buffer,
      maxX - 1,
      originY,
      `${borderColor}┐${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    );
    setCell(
      ctx.buffer,
      originX,
      maxY - 1,
      `${borderColor}└${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    );
    setCell(
      ctx.buffer,
      maxX - 1,
      maxY - 1,
      `${borderColor}┘${resetCode}`,
      ctx.clip,
      ctx.dirtyRows
    );

    const contentWidth = Math.max(0, this.width - 2);
    const contentY = originY + Math.floor(this.height / 2);
    const display =
      this.value.length > 0 ? this.value : this.placeholder;
    const displayColor =
      this.value.length > 0 ? this.textColor : this.placeholderColor;
    const colorCode = getColorCode(displayColor);
    const bgCode = getColorCode(this.backgroundColor);

    const cursorOffset = Math.max(0, this.cursor - (contentWidth - 1));
    const slice = display.slice(cursorOffset, cursorOffset + contentWidth);

    for (let i = 0; i < contentWidth; i++) {
      const ch = slice[i] ?? " ";
      setCell(
        ctx.buffer,
        originX + 1 + i,
        contentY,
        `${bgCode}${colorCode}${ch}${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
    }

    if (this.isFocused && contentWidth > 0) {
      const cursorIndex = Math.min(
        this.cursor - cursorOffset,
        contentWidth - 1
      );
      const cursorChar = slice[cursorIndex] ?? " ";
      const cursorX = originX + 1 + cursorIndex;
      setCell(
        ctx.buffer,
        cursorX,
        contentY,
        `${bgCode}\x1b[7m${cursorChar}${resetCode}`,
        ctx.clip,
        ctx.dirtyRows
      );
    }
  }
}
