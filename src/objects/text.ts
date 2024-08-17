import { TideObject } from "../interfaces";

class Text implements TideObject {
    data: any;
    parent: TideObject|null;
    children: TideObject[]|null;

    constructor(text: string, parent: TideObject) {
        this.data = text;
        this.parent = parent;
        this.children = null;
    }

    display() {

    }
}