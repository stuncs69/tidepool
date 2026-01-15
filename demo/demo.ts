import { Box, Line, Text, TideScreen, setupInput } from "../src/index";

const screen = new TideScreen(
  process.stdout.columns - 1,
  process.stdout.rows - 1
);

screen.enableAutoResize();

const box = new Box(2, 2, 30, 6, "reset", "cyan", "reset", "Demo", 1);
const line = new Line(0, 1, 26, "yellow", 1);
const text = new Text(0, 2, "Use arrow keys to move, q to quit.", "green", 1);

box.addContent(line);
box.addContent(text);
screen.addComponent(box);

screen.nextFrame();

const cleanup = setupInput((_str, key) => {
  if (key.name === "q" || (key.ctrl && key.name === "c")) {
    cleanup();
    process.stdout.write("\x1b[?25h");
    process.exit(0);
  }

  if (key.name === "up") {
    box.move(0, -1);
  } else if (key.name === "down") {
    box.move(0, 1);
  } else if (key.name === "left") {
    box.move(-1, 0);
  } else if (key.name === "right") {
    box.move(1, 0);
  }

  screen.nextFrame();
});
