import * as React from "react";
import { StateType } from "react-gesture-responder";
import { useMeasure } from "./use-measure";
import { GridContext } from "./GridContext";
import { GridSettings, ChildRender } from "./grid-types";
import { GridItem } from "./GridItem";
import swap from "./swap";
import { getPositionForIndex } from "./helpers";

type GridDropZoneProps<T> = {
  items: T[];
  boxesPerRow: number;
  rowHeight: number;
  id: string;
  children: ChildRender<T>;
  disableDrag?: boolean;
  disableDrop?: boolean;
  style?: React.CSSProperties;
};

interface PlaceholderType {
  startIndex: number;
  targetIndex: number;
}

export function GridDropZone<T>({
  items,
  id,
  boxesPerRow,
  children,
  disableDrag = false,
  disableDrop = false,
  rowHeight,
  ...other
}: GridDropZoneProps<T>) {
  const {
    traverse,
    startTraverse,
    endTraverse,
    register,
    onChange,
    remove,
    getActiveDropId
  } = React.useContext(GridContext);

  const ref = React.useRef<HTMLDivElement>(null);
  const { bounds } = useMeasure(ref);
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const [placeholder, setPlaceholder] = React.useState<PlaceholderType | null>(
    null
  );

  const traverseIndex =
    traverse && traverse.targetId === id ? traverse.targetIndex : null;

  const grid: GridSettings = {
    columnWidth: bounds.width / boxesPerRow,
    boxesPerRow,
    rowHeight
  };

  /**
   * Register our dropzone with our grid context
   */

  React.useEffect(() => {
    register(id, {
      top: bounds.top,
      bottom: bounds.bottom,
      left: bounds.left,
      right: bounds.right,
      width: bounds.width,
      height: bounds.height,
      count: items.length,
      grid,
      disableDrop
    });
  }, [items, bounds, id, grid]);

  /**
   * Unregister when unmounting
   */

  React.useEffect(() => {
    return () => remove(id);
  }, [id]);

  const itemsIndexes = items.map((_, i) => i);

  return (
    <div ref={ref} {...other}>
      {items.map((item: any, i) => {
        const isTraverseTarget =
          traverse && traverse.targetId === id && traverse.targetIndex === i;

        const order = placeholder
          ? swap(itemsIndexes, placeholder.startIndex, placeholder.targetIndex)
          : itemsIndexes;

        const pos = getPositionForIndex(order.indexOf(i), grid, traverseIndex);

        /**
         * Handle a child being dragged
         * @param state
         * @param x
         * @param y
         */

        function onMove(state: StateType, x: number, y: number) {
          if (draggingIndex !== i) {
            setDraggingIndex(i);
          }

          const targetDropId = getActiveDropId(
            id,
            x + grid.columnWidth / 2,
            y + grid.rowHeight / 2
          );

          if (targetDropId && targetDropId !== id) {
            startTraverse(id, targetDropId, x, y, i);
          } else {
            endTraverse();
          }

          const targetIndex =
            targetDropId !== id
              ? items.length
              : getTargetIndex(
                  i,
                  grid,
                  items.length,
                  state.delta[0],
                  state.delta[1]
                );

          if (targetIndex !== i) {
            if (
              (placeholder && placeholder.targetIndex !== targetIndex) ||
              !placeholder
            ) {
              setPlaceholder({
                targetIndex,
                startIndex: i
              });
            }
          } else if (placeholder) {
            setPlaceholder(null);
          }
        }

        /**
         * Handle end events
         */

        function onEnd(state: StateType, x: number, y: number) {
          const targetDropId = getActiveDropId(
            id,
            x + grid.columnWidth / 2,
            y + grid.rowHeight / 2
          );

          const targetIndex =
            targetDropId !== id
              ? items.length
              : getTargetIndex(
                  i,
                  grid,
                  items.length,
                  state.delta[0],
                  state.delta[1]
                );

          // traverse?
          if (traverse) {
            onChange(
              traverse.sourceId,
              traverse.sourceIndex,
              traverse.targetIndex,
              traverse.targetId
            );
          } else {
            onChange(id, i, targetIndex);
          }

          setPlaceholder(null);
          setDraggingIndex(null);
        }

        return (
          <GridItem
            key={item.id}
            item={item}
            top={pos.xy[1]}
            disableDrag={disableDrag}
            mountWithTraverseTarget={
              isTraverseTarget ? [traverse!.tx, traverse!.ty] : undefined
            }
            left={pos.xy[0]}
            i={i}
            onMove={onMove}
            onEnd={onEnd}
            grid={grid}
            dragging={i === draggingIndex}
          >
            {children}
          </GridItem>
        );
      })}
    </div>
  );
}

/**
 * Get the active drag position given its initial
 * coordinates and grid meta
 * @param index
 * @param grid
 * @param dx
 * @param dy
 */

function getDragPosition(
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
 * Given relative coordinates, determine which index
 * we are currently in
 * @param x
 * @param y
 * @param param2
 */

export function getIndexFromCoordinates(
  x: number,
  y: number,
  { rowHeight, boxesPerRow, columnWidth }: GridSettings,
  count: number
) {
  const index =
    Math.floor(y / rowHeight) * boxesPerRow + Math.floor(x / columnWidth);
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

function getTargetIndex(
  startIndex: number,
  grid: GridSettings,
  count: number,
  dx: number,
  dy: number
) {
  const {
    xy: [cx, cy]
  } = getDragPosition(startIndex, grid, dx, dy, true);
  return getIndexFromCoordinates(cx, cy, grid, count);
}
