import readline from "readline";
import type { Focusable, KeyInfo } from "./interfaces";

export type KeypressHandler = (str: string, key: KeyInfo) => void;
export type MouseHandler = (event: MouseEvent) => void;

export interface MouseEvent {
  x: number;
  y: number;
  button: number;
  type: "down" | "up";
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export interface InputHandlers {
  onKey?: KeypressHandler;
  onMouse?: MouseHandler;
  enableMouse?: boolean;
}

function enableMouseReporting(output: NodeJS.WriteStream) {
  output.write("\x1b[?1000h");
  output.write("\x1b[?1006h");
}

function disableMouseReporting(output: NodeJS.WriteStream) {
  output.write("\x1b[?1000l");
  output.write("\x1b[?1006l");
}

function parseMouseEvent(data: string): MouseEvent | null {
  if (!data.startsWith("\x1b[<")) {
    return null;
  }
  const match = data.match(/^\x1b\[<(\d+);(\d+);(\d+)([mM])$/);
  if (!match) {
    return null;
  }
  const code = Number(match[1]);
  const x = Number(match[2]);
  const y = Number(match[3]);
  const isDown = match[4] === "M";
  const button = code & 3;
  return {
    x: x - 1,
    y: y - 1,
    button,
    type: isDown ? "down" : "up",
    shift: Boolean(code & 4),
    meta: Boolean(code & 8),
    ctrl: Boolean(code & 16),
  };
}

export function setupInput(
  handlerOrOptions: KeypressHandler | InputHandlers,
  input: NodeJS.ReadStream = process.stdin,
  output: NodeJS.WriteStream = process.stdout
) {
  const options: InputHandlers =
    typeof handlerOrOptions === "function"
      ? { onKey: handlerOrOptions }
      : handlerOrOptions;
  const onKey = options.onKey;
  const onMouse = options.onMouse;
  const enableMouse = options.enableMouse ?? Boolean(onMouse);

  readline.emitKeypressEvents(input);
  if (input.isTTY) {
    input.setRawMode(true);
  }
  input.resume();

  const keyHandler = (str: string | undefined, key: readline.Key) => {
    if (onKey) {
      onKey(str ?? "", key);
    }
  };

  input.on("keypress", keyHandler);

  let dataHandler: ((data: Buffer) => void) | null = null;
  if (enableMouse && onMouse) {
    enableMouseReporting(output);
    dataHandler = (data: Buffer) => {
      const ev = parseMouseEvent(data.toString("utf8"));
      if (ev) {
        onMouse(ev);
      }
    };
    input.on("data", dataHandler);
  }

  return () => {
    input.off("keypress", keyHandler);
    if (dataHandler) {
      input.off("data", dataHandler);
      disableMouseReporting(output);
    }
    if (input.isTTY) {
      input.setRawMode(false);
    }
    input.pause();
  };
}

export class InputManager {
  private focusables: Focusable[] = [];
  private focusedIndex = -1;

  register(focusable: Focusable) {
    this.focusables.push(focusable);
    this.sortFocusables();
    if (this.focusedIndex === -1) {
      this.focus(0);
    }
  }

  unregister(focusable: Focusable) {
    const index = this.focusables.indexOf(focusable);
    if (index === -1) {
      return;
    }
    if (this.focusedIndex === index) {
      this.focusables[index].blur();
      this.focusedIndex = -1;
    }
    this.focusables.splice(index, 1);
    if (this.focusables.length > 0 && this.focusedIndex === -1) {
      this.focus(0);
    }
  }

  focusNext() {
    if (this.focusables.length === 0) {
      return;
    }
    const next = (this.focusedIndex + 1) % this.focusables.length;
    this.focus(next);
  }

  focusPrevious() {
    if (this.focusables.length === 0) {
      return;
    }
    const prev =
      (this.focusedIndex - 1 + this.focusables.length) %
      this.focusables.length;
    this.focus(prev);
  }

  handleKey(input: string, key: KeyInfo) {
    if (key.name === "tab") {
      if (key.shift) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
      return true;
    }
    if (this.focusedIndex === -1) {
      return false;
    }
    return this.focusables[this.focusedIndex].handleKey(input, key);
  }

  handleMouse(event: MouseEvent) {
    if (event.type !== "down" || event.button !== 0) {
      return false;
    }
    const target = this.findTopmostAt(event.x, event.y);
    if (!target) {
      return false;
    }
    const index = this.focusables.indexOf(target);
    if (index !== -1) {
      this.focus(index);
    }
    return target.handleClick(event.x, event.y);
  }

  private focus(index: number) {
    if (index < 0 || index >= this.focusables.length) {
      return;
    }
    if (this.focusedIndex !== -1) {
      this.focusables[this.focusedIndex].blur();
    }
    this.focusedIndex = index;
    this.focusables[this.focusedIndex].focus();
  }

  private sortFocusables() {
    this.focusables.sort((a, b) => b.zIndex - a.zIndex);
  }

  private findTopmostAt(x: number, y: number) {
    for (const focusable of this.focusables) {
      if (focusable.contains(x, y)) {
        return focusable;
      }
    }
    return null;
  }
}

export function setupInputManager(
  manager: InputManager,
  input: NodeJS.ReadStream = process.stdin,
  output: NodeJS.WriteStream = process.stdout,
  afterInput?: () => void
) {
  return setupInput(
    {
      onKey: (str, key) => {
        manager.handleKey(str, key);
        if (afterInput) {
          afterInput();
        }
      },
      onMouse: (event) => {
        manager.handleMouse(event);
        if (afterInput) {
          afterInput();
        }
      },
    },
    input,
    output
  );
}
