import type { Rect } from "./interfaces";

export function getColorCode(color: string) {
  const colors: { [key: string]: string } = {
    reset: "\x1b[0m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    random: "\x1b[38;5;" + Math.floor(Math.random() * 256) + "m",
  };

  return colors[color.toLowerCase()] || colors["reset"];
}

export function wrapText(text: string, maxWidth: number) {
    const lines = [];
    let currentLine = '';
  
    for (const word of text.split(' ')) {
      if ((currentLine + word).length > maxWidth) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    lines.push(currentLine.trim());
  
    return lines;
}

export function intersectRect(a: Rect, b: Rect): Rect | null {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);

  if (x2 <= x1 || y2 <= y1) {
    return null;
  }

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export function setCell(
  buffer: string[][],
  x: number,
  y: number,
  value: string,
  clip?: Rect,
  dirtyRows?: Set<number>
) {
  if (y < 0 || x < 0 || y >= buffer.length || x >= buffer[0].length) {
    return;
  }
  if (clip) {
    if (
      x < clip.x ||
      y < clip.y ||
      x >= clip.x + clip.width ||
      y >= clip.y + clip.height
    ) {
      return;
    }
  }
  buffer[y][x] = value;
  if (dirtyRows) {
    dirtyRows.add(y);
  }
}
