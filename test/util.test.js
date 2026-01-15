const test = require("node:test");
const assert = require("node:assert/strict");

const { getColorCode, wrapText, setCell } = require("../dist/util.js");

test("getColorCode returns ANSI codes for known colors", () => {
  assert.equal(getColorCode("red"), "\x1b[31m");
  assert.equal(getColorCode("gray"), "\x1b[90m");
});

test("wrapText respects max width", () => {
  const lines = wrapText("hello world from tidepool", 6);
  assert.deepEqual(lines, ["hello", "world", "from", "tidepool"]);
});

test("setCell respects clip rect and bounds", () => {
  const buffer = Array.from({ length: 2 }, () => Array(2).fill(" "));
  setCell(buffer, 1, 1, "x", { x: 0, y: 0, width: 1, height: 1 });
  setCell(buffer, 0, 0, "y", { x: 0, y: 0, width: 1, height: 1 });
  assert.equal(buffer[1][1], " ");
  assert.equal(buffer[0][0], "y");
});
