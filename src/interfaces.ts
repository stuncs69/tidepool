export interface TideObject {
    data: any;
    parent: TideObject|null;
    children: TideObject[]|null;
    display: Function;
}