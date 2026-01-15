import {
  Box,
  Button,
  InputField,
  InputManager,
  TideScreen,
  setupInputManager,
} from "../src/index";
import { getColorCode, setCell, wrapText } from "../src/util";
import type { RenderContext, TideObject } from "../src/interfaces";

class Messages implements TideObject {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  lines: string[] = [];
  color: string;

  constructor(x: number, y: number, width: number, height: number, color = "white", zIndex = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.zIndex = zIndex * 10;
  }

  addMessage(text: string) {
    const wrapped = wrapText(text, Math.max(1, this.width - 2));
    this.lines.push(...wrapped);
  }

  draw(ctx: RenderContext) {
    const originX = ctx.origin.x + this.x;
    const originY = ctx.origin.y + this.y;
    const maxLines = Math.max(0, this.height);
    const start = Math.max(0, this.lines.length - maxLines);
    const visible = this.lines.slice(start);
    const colorCode = getColorCode(this.color);
    const resetCode = "\x1b[0m";

    for (let row = 0; row < maxLines; row++) {
      const line = visible[row] ?? "";
      for (let col = 0; col < this.width; col++) {
        const ch = line[col] ?? " ";
        setCell(
          ctx.buffer,
          originX + col,
          originY + row,
          `${colorCode}${ch}${resetCode}`,
          ctx.clip,
          ctx.dirtyRows
        );
      }
    }
  }
}

const screen = new TideScreen(
  process.stdout.columns - 1,
  process.stdout.rows - 1
);
screen.enableAutoResize();

const padding = 1;
const inputHeight = 3;
const inputWidth = Math.max(20, screen.width - padding * 2 - 12);
const inputY = screen.height - inputHeight - padding;
const inputX = padding + 1;

const messagesBox = new Box(
  padding,
  padding,
  screen.width - padding * 2,
  screen.height - inputHeight - padding * 2 - 1,
  "reset",
  "cyan",
  "reset",
  "Chat",
  1
);

const messages = new Messages(
  padding + 2,
  padding + 2,
  messagesBox.width - 4,
  messagesBox.height - 4,
  "white",
  1
);

const input = new InputField(inputX, inputY, inputWidth, inputHeight, "", {
  placeholder: "Type a message...",
  zIndex: 2,
});

const sendButton = new Button(
  2,
  inputX + inputWidth + 1,
  inputY,
  10,
  inputHeight,
  "Send",
  "white",
  "blue",
  {
    onPress: () => {
      const trimmed = input.value.trim();
      if (!trimmed) {
        return;
      }
      messages.addMessage(trimmed);
      input.value = "";
      input.cursor = 0;
      screen.nextFrame();
    },
  }
);

screen.addComponent(messagesBox);
screen.addComponent(messages);
screen.addComponent(input);
screen.addComponent(sendButton);

const manager = new InputManager();
manager.register(input);
manager.register(sendButton);

const cleanup = setupInputManager(manager, process.stdin, process.stdout, () => {
  screen.nextFrame();
});

process.on("SIGINT", () => {
  cleanup();
  process.stdout.write("\x1b[?25h");
  process.exit(0);
});

input.onSubmit = () => {
  sendButton.handleClick(0, 0);
};

screen.nextFrame();
