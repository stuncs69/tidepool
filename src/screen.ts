export class TideScreen {
    width: number;
    height: number;

    constructor() {
        this.width = 0;
        this.height = 0;
    }

    setDimensions(height: number, width: number): TideScreen {
        this.height = height;
        this.width = width;
        return this;
    }
}