import { GridSettings } from "./grid-types";
/**
 * Get the active drag position given its initial
 * coordinates and grid meta
 * @param index
 * @param grid
 * @param dx
 * @param dy
 */
export declare function getDragPosition(index: number, grid: GridSettings, dx: number, dy: number, center?: boolean): {
    xy: number[];
};
/**
 * Get the relative top, left position for a particular
 * index in a grid
 * @param i
 * @param grid
 * @param traverseIndex (destination for traverse)
 */
export declare function getPositionForIndex(i: number, { boxesPerRow, rowHeight, columnWidth }: GridSettings, traverseIndex?: number | false | null): {
    xy: number[];
};
/**
 * Given relative coordinates, determine which index
 * we are currently in
 * @param x
 * @param y
 * @param param2
 */
export declare function getIndexFromCoordinates(x: number, y: number, { rowHeight, boxesPerRow, columnWidth }: GridSettings, count: number): number;
/**
 * Get the target index during a drag
 * @param startIndex
 * @param grid
 * @param count
 * @param dx
 * @param dy
 */
export declare function getTargetIndex(startIndex: number, grid: GridSettings, count: number, dx: number, dy: number): number;
