# 🌊 Tidepool
A TUI library written in TypeScript.

### What tidepool offers 🔥
- Modular API 🔧
- Lightweight 🪶
- Type-safe ⌨️
- Easy to integrate with other technologies 💡

API Example using readline for movement:
```ts
import { TideScreen, Box, Text, Line } from "tidepool";
import readline from 'readline';

// Create new tidepool screen instance
const tui = new TideScreen(process.stdout.columns-1, process.stdout.rows-1);

// Create text to be displayed inside of boxes
const text = new Text(0, 0, "Welcome to tidepool!", 'cyan', 1);
const text2 = new Text(0, 1, "This is a tidepool example with readline.", 'green', 1);

// search for the middle of the screen and define first box
const x = Math.floor(process.stdout.columns / 2)
const y = Math.floor(process.stdout.rows / 2)
const box = new Box(x, y, 25, 3, 'magenta', 'Tidepool Box', 1);

// Define the box that will be under the other box
const underBox = new Box(x-5, y-5, 25, 10, 'red', 'Under the other one', 2);

// Define a cosmetic line
const line = new Line(0, 0, underBox.width-2, 'yellow', 1);

// Add content and components to the screen
box.addContent(text);
underBox.addContent(text2);
underBox.addContent(line);

tui.addComponent(box);
tui.addComponent(underBox);

// Render first frame
tui.nextFrame();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Listen for keypresses
process.stdin.on('keypress', (str, key) => {
  if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    process.exit();
  } else {
    if (key.name === 'up' && box.y > 0) {
      box.move(0, -1);
    } else if (key.name === 'down' && box.y + box.height < tui.height) {
      box.move(0, 1);
    } else if (key.name === 'left' && box.x > 0) {
      box.move(-1, 0);
    } else if (key.name === 'right' && box.x + box.width < tui.width) {
      box.move(1, 0);
    }

    // Render new frame after box moved.
    tui.nextFrame();
  }
});

```

## Repository
[GitHub Repository](https://github.com/stuncs69/tidepool)</br>
[NPM](https://www.npmjs.com/package/tidepool)