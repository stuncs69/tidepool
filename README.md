# 🌊 Tidepool
A TUI library written in TypeScript.

Tidepool renders to a terminal using a buffered, diffed frame loop and a small set
of composable primitives (boxes, text, lines, buttons, input fields). It is
intended to be lightweight, hackable, and friendly to custom components.

## Contents
- Installation
- Quick start
- Core concepts
- Screen lifecycle
- Input handling
- Components
- Effects
- Custom components
- Demos
- Performance notes
- Troubleshooting
- Migration notes

## Installation
```bash
npm install tidepool
```

## Quick start
```ts
import {
  Box,
  Line,
  Text,
  TideScreen,
  setupInput,
} from "tidepool";

const screen = new TideScreen(
  process.stdout.columns - 1,
  process.stdout.rows - 1
);

screen.enableAutoResize();

const box = new Box(2, 2, 28, 6, "reset", "magenta", "reset", "Tidepool", 1);
const line = new Line(0, 1, 24, "yellow", 1);
const text = new Text(0, 2, "Use arrow keys to move, q to quit.", "green", 1);

box.addContent(line);
box.addContent(text);
screen.addComponent(box);
screen.nextFrame();

const cleanup = setupInput((_, key) => {
  if (key.name === "q" || (key.ctrl && key.name === "c")) {
    cleanup();
    process.stdout.write("\x1b[?25h");
    process.exit(0);
  }
  if (key.name === "up") box.move(0, -1);
  if (key.name === "down") box.move(0, 1);
  if (key.name === "left") box.move(-1, 0);
  if (key.name === "right") box.move(1, 0);
  screen.nextFrame();
});
```

## Core concepts
- Coordinates are 0-based. All draws are clipped to the screen bounds.
- Components added to a `Box` are positioned relative to the box interior.
- Higher `zIndex` renders on top. Use `TideScreen.invalidateSort()` if you change
  zIndex after adding.
- Rendering is double-buffered: the back buffer is composed and diffs are written
  to stdout.

## Screen lifecycle
### `TideScreen`
```ts
const screen = new TideScreen(width, height, backgroundColor?);
```
- `nextFrame()`: render one frame.
- `renderCycle(beforeRender?, afterRender?)`: fixed-rate loop (requires `setFPS`).
- `setFPS(fps: number)`: set loop speed.
- `setUpdateFunction(fn)`: inject per-frame updates.
- `resize(width, height)`: rebuild buffers to new size.
- `enableAutoResize(getSize?)`: remeasure on `SIGWINCH`.
- `disableAutoResize()`: stop listening for resize.
- `invalidateSort()`: re-sort components if zIndex changed.

### Backgrounds
`backgroundColor` supports standard color names plus `transparent` and `random`.
If set to `transparent`, Tidepool will skip background fill for faster rendering.

## Input handling
### `setupInput`
```ts
const cleanup = setupInput({
  onKey: (str, key) => {},
  onMouse: (event) => {},
  enableMouse: true,
});
```
- Returns a cleanup function that restores terminal state.
- Mouse handling uses xterm SGR mouse mode; not all terminals support it.

### `InputManager`
```ts
const manager = new InputManager();
manager.register(inputField);
manager.register(button);

const cleanup = setupInputManager(manager, process.stdin, process.stdout, () => {
  screen.nextFrame();
});
```
- `Tab` / `Shift+Tab` cycles focus.
- Clicking a focusable also focuses it.

## Components
### `Box`
```ts
new Box(x, y, width, height, color?, borderColor?, backgroundColor?, title?, zIndex?);
```
- Renders a bordered container and manages child content.
- Use `addContent()` to render `Text`, `Line`, or custom components inside.

### `Text`
```ts
new Text(x, y, text, color?, zIndex?);
```
- Word-wraps to the container width by default.

### `Line`
```ts
new Line(x, y, length, color?, zIndex?);
```

### `Button`
```ts
new Button(zIndex, x, y, width, height, text, textColor?, backgroundColor?, options?);
```
Options:
- `onPress?: () => void`
- `focusedBackgroundColor?: string`
- `focusedTextColor?: string`

### `InputField`
```ts
new InputField(x, y, width, height?, initialValue?, options?);
```
Options:
- `zIndex?: number`
- `textColor?: string`
- `backgroundColor?: string`
- `borderColor?: string`
- `placeholder?: string`
- `placeholderColor?: string`
- `maxLength?: number`
- `onChange?: (value: string) => void`
- `onSubmit?: (value: string) => void`

## Effects
### `Shadow`
```ts
new Shadow(offsetX?, offsetY?, color?);
```
Apply to a `Box` or other `TideEffect` target:
```ts
box.addEffect(new Shadow(1, 1, "gray"));
```

## Custom components
Implement `TideObject` and draw via `RenderContext`:
```ts
import type { RenderContext, TideObject } from "tidepool";
import { setCell, getColorCode } from "tidepool/dist/util";

class Badge implements TideObject {
  zIndex = 10;
  constructor(private x: number, private y: number, private text: string) {}
  draw(ctx: RenderContext) {
    const color = getColorCode("cyan");
    const reset = "\x1b[0m";
    for (let i = 0; i < this.text.length; i++) {
      setCell(
        ctx.buffer,
        ctx.origin.x + this.x + i,
        ctx.origin.y + this.y,
        `${color}${this.text[i]}${reset}`,
        ctx.clip,
        ctx.dirtyRows
      );
    }
  }
}
```

## Demos
```bash
npm run demo
npm run demo:stack
npm run demo:form
npm run demo:chat
```

Run with Bun:
```bash
bun demo/demo.ts
bun demo/stacking.ts
bun demo/form.ts
bun demo/chat.ts
```

## Performance notes
- Use `transparent` background for faster renders.
- Avoid per-frame resorting by setting `zIndex` before adding components.
- For heavy scenes, render only on state changes rather than a fixed FPS loop.

## Troubleshooting
- If input feels unresponsive, ensure `setupInput` is called and you are calling
  `nextFrame()` after handling keys.
- If mouse clicks do not work, your terminal may not support SGR mouse mode.
- If the cursor disappears, make sure you clean up on exit and restore it with
  `\x1b[?25h`.

## Migration notes (v1.0.6 -> current)
- `draw(...)` now receives a `RenderContext` instead of buffer + offsets.
- Component draws are clipped by a render context; negative coordinates are safe.

## Repository
[GitHub Repository](https://github.com/stuncs69/tidepool)  
[NPM](https://www.npmjs.com/package/tidepool)
