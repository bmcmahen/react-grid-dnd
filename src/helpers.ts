import { GridSettings } from "./grid-types";

/**
 * Get the active drag position given its initial
 * coordinates and grid meta
 * @param index
 * @param grid
 * @param dx
 * @param dy
 */

export function getDragPosition(
  index: number,
  grid: GridSettings,
  dx: number,
  dy: number,
  center?: boolean
) {
  const {
    xy: [left, top]
  } = getPositionForIndex(index, grid);
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

export function getPositionForIndex(
  i: number,
  { boxesPerRow, rowHeight, columnWidth }: GridSettings,
  traverseIndex?: number | false | null
) {
  const index =
    typeof traverseIndex == "number" ? (i >= traverseIndex ? i + 1 : i) : i;
  const x = (index % boxesPerRow) * columnWidth;
  const y = Math.floor(index / boxesPerRow) * rowHeight;
  return {
    xy: [x, y]
  };
}
