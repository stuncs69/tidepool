import {
  Button,
  InputField,
  InputManager,
  Text,
  TideScreen,
  setupInputManager,
} from "../src/index";

const screen = new TideScreen(
  process.stdout.columns - 1,
  process.stdout.rows - 1
);
screen.enableAutoResize();

const title = new Text(2, 1, "Tab to switch, click to focus, Enter to submit.", "cyan", 1);
const nameField = new InputField(2, 3, 32, 3, "", {
  placeholder: "Name",
  zIndex: 1,
});
const emailField = new InputField(2, 7, 32, 3, "", {
  placeholder: "Email",
  zIndex: 1,
});
const submitButton = new Button(
  1,
  2,
  11,
  12,
  3,
  "Submit",
  "white",
  "blue",
  {
    onPress: () => {
      statusText.text = `Submitted: ${nameField.value} / ${emailField.value}`;
      screen.nextFrame();
    },
  }
);

const statusText = new Text(2, 15, "", "yellow", 1);

screen.addComponent(title);
screen.addComponent(nameField);
screen.addComponent(emailField);
screen.addComponent(submitButton);
screen.addComponent(statusText);

const inputManager = new InputManager();
inputManager.register(nameField);
inputManager.register(emailField);
inputManager.register(submitButton);

const cleanup = setupInputManager(inputManager, process.stdin, process.stdout, () => {
  screen.nextFrame();
});

process.on("SIGINT", () => {
  cleanup();
  process.stdout.write("\x1b[?25h");
  process.exit(0);
});

screen.nextFrame();
