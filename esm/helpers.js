import { __read } from "tslib";
/**
 * Get the active drag position given its initial
 * coordinates and grid meta
 * @param index
 * @param grid
 * @param dx
 * @param dy
 */
export function getDragPosition(index, grid, dx, dy, center) {
    var _a = __read(getPositionForIndex(index, grid).xy, 2), left = _a[0], top = _a[1];
    return {
        xy: [
            left + dx + (center ? grid.columnWidth / 2 : 0),
            top + dy + (center ? grid.rowHeight / 2 : 0)
        ]
    };
}
/**
 * Get the relative top, left position for a particular
 * index in a grid
 * @param i
 * @param grid
 * @param traverseIndex (destination for traverse)
 */
export function getPositionForIndex(i, _a, traverseIndex) {
    var boxesPerRow = _a.boxesPerRow, rowHeight = _a.rowHeight, columnWidth = _a.columnWidth;
    var index = typeof traverseIndex == "number" ? (i >= traverseIndex ? i + 1 : i) : i;
    var x = (index % boxesPerRow) * columnWidth;
    var y = Math.floor(index / boxesPerRow) * rowHeight;
    return {
        xy: [x, y]
    };
}
/**
 * Given relative coordinates, determine which index
 * we are currently in
 * @param x
 * @param y
 * @param param2
 */
export function getIndexFromCoordinates(x, y, _a, count) {
    var rowHeight = _a.rowHeight, boxesPerRow = _a.boxesPerRow, columnWidth = _a.columnWidth;
    var index = Math.floor(y / rowHeight) * boxesPerRow + Math.floor(x / columnWidth);
    return index >= count ? count : index;
}
/**
 * Get the target index during a drag
 * @param startIndex
 * @param grid
 * @param count
 * @param dx
 * @param dy
 */
export function getTargetIndex(startIndex, grid, count, dx, dy) {
    var _a = __read(getDragPosition(startIndex, grid, dx, dy, true).xy, 2), cx = _a[0], cy = _a[1];
    return getIndexFromCoordinates(cx, cy, grid, count);
}
