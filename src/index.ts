import process from 'process';
import { TideScreen } from './screen';
import { TideObject } from './interfaces';

class Display {
    private out: NodeJS.WriteStream;
    private currentScreen: TideScreen

    constructor(out: NodeJS.WriteStream) {
        this.out = process.stdout;
        this.currentScreen = new TideScreen();
    }

    screen(height: number, width: number) {
        this.currentScreen.setDimensions(height, width);
    }

    text(text: string, parent: TideObject) {
        
    }
}

const x = new Display(process.stdout);

x.screen(100, 200);