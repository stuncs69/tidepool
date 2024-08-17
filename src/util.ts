export function getColorCode(color: string) {
    const colors: { [key: string]: string } = {
      reset: '\x1b[0m',
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      random: '\x1b[38;5;' + Math.floor(Math.random() * 256) + 'm',
    };
    
    return colors[color.toLowerCase()] || colors['reset'];
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