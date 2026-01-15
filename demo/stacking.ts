import { Box, TideScreen, setupInput } from "../src/index";

const screen = new TideScreen(
  process.stdout.columns - 1,
  process.stdout.rows - 1
);

screen.enableAutoResize();

const boxes: Box[] = [];
const maxBoxes = 30;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnBox() {
  const width = randInt(8, 24);
  const height = randInt(3, 8);
  const x = randInt(0, Math.max(0, screen.width - width));
  const y = randInt(0, Math.max(0, screen.height - height));
  const zIndex = randInt(0, 5);

  const colors = ["red", "green", "yellow", "blue", "magenta", "cyan"];
  const color = colors[randInt(0, colors.length - 1)];

  const box = new Box(x, y, width, height, "reset", color, "reset", `z${zIndex}`, zIndex);
  boxes.push(box);
  screen.addComponent(box);

  if (boxes.length > maxBoxes) {
    boxes.shift();
    screen.invalidateSort();
  }
}

screen.setFPS(10);
screen.setUpdateFunction(() => {
  spawnBox();
});

const cleanup = setupInput((_str, key) => {
  if (key.name === "q" || (key.ctrl && key.name === "c")) {
    cleanup();
    process.stdout.write("\x1b[?25h");
    process.exit(0);
  }
});

screen.renderCycle();
