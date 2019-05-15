import * as React from "react";
import { useSprings } from "react-spring";
import { StateType } from "react-gesture-responder";
import { useMeasure } from "./use-measure";
import { GridContext } from "./GridContext";
import { GridSettings, ChildRender, TraverseType } from "./grid-types";
import { GridItem } from "./GridItem";
import swap from "./swap";

type GridDropZoneProps<T> = {
  items: T[];
  boxesPerRow: number;
  rowHeight: number;
  id: string;
  children: ChildRender<T>;
  style?: React.CSSProperties;
};

export function GridDropZone<T>({
  items,
  id,
  boxesPerRow,
  children,
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
  const order = React.useRef(items.map((_, i) => i));
  const traverseIndex =
    traverse && traverse.targetId === id ? traverse.targetIndex : null;

  const grid: GridSettings = {
    columnWidth: bounds.width / boxesPerRow,
    boxesPerRow,
    rowHeight
  };

  const [springs, setSprings] = useSprings(
    items.length,
    getFinalPositions(grid)
  );

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
      grid
    });
  }, [items, bounds, id, grid]);

  /**
   * Unregister when unmounting
   */

  React.useEffect(() => {
    return () => remove(id);
  }, [id]);

  React.useEffect(() => {
    if (typeof traverseIndex === "number") {
      setSprings(getFinalPositions(grid, traverseIndex));
    }
  }, [grid, traverseIndex, order.current, setSprings]);

  /**
   * Maintain updated order whenever our list
   * of items changes
   */

  React.useEffect(() => {
    order.current = items.map((_, i) => i);
  }, [order, items]);

  /**
   * If our bounds change, alter our positions
   */

  React.useEffect(() => {
    setSprings(getFinalPositions(grid));
  }, [bounds]);

  return (
    <div ref={ref} {...other}>
      {springs.map((styles, i) => {
        /**
         * Handle dragging
         */

        function onMove(state: StateType) {
          const startIndex = order.current.indexOf(i);
          const startPosition = getDragPosition(
            startIndex,
            grid,
            state.delta[0],
            state.delta[1]
          );

          const targetDropId = getActiveDropId(
            id,
            startPosition.xy[0] + grid.columnWidth / 2,
            startPosition.xy[1] + grid.rowHeight / 2
          );

          // are we dragging over another dropzone?
          if (targetDropId && targetDropId !== id) {
            startTraverse(
              id,
              targetDropId,
              startPosition.xy[0],
              startPosition.xy[1],
              startIndex
            );
          } else {
            endTraverse();
          }

          // get the target index
          const targetIndex =
            targetDropId !== id
              ? items.length
              : getTargetIndex(
                  startIndex,
                  grid,
                  items.length,
                  state.delta[0],
                  state.delta[1]
                );

          // get our new order
          const newOrder = swap(
            order.current,
            startIndex,
            targetIndex
          ) as number[];

          // set springs given this order
          setSprings(
            getPositionsOnDrag(
              newOrder,
              grid,
              i,
              startIndex,
              state.delta,
              traverseIndex
            )
          );
        }

        /**
         * Handle release
         * @param state
         */

        function onEnd(state: StateType) {
          const startIndex = order.current.indexOf(i);
          const targetIndex = getTargetIndex(
            startIndex,
            grid,
            items.length,
            state.delta[0],
            state.delta[1]
          );

          const newOrder = swap(
            order.current,
            startIndex,
            targetIndex
          ) as number[];

          const releaseTraverse =
            traverse && traverse.sourceId === id ? traverse : undefined;

          setSprings(
            getPositionsOnRelease(
              newOrder,
              grid,
              startIndex,
              releaseTraverse,
              () => {
                if (traverse) {
                  onChange(
                    traverse.sourceId,
                    traverse.sourceIndex,
                    traverse.targetIndex,
                    traverse.targetId
                  );
                }
              }
            )
          );

          order.current = newOrder;
        }

        return (
          <GridItem
            key={i}
            i={i}
            width={grid.columnWidth}
            height={rowHeight}
            item={items[i]}
            styles={styles}
            onMove={onMove}
            onEnd={onEnd}
          >
            {children}
          </GridItem>
        );
      })}
    </div>
  );
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

/**
 * Determine final animation state independently of dragging
 * @param grid
 */

function getFinalPositions(
  grid: GridSettings,
  traverseIndex?: number | false | null
) {
  return (i: number) => {
    return {
      ...getPositionForIndex(i, grid, traverseIndex),
      immediate: false,
      reset: traverseIndex == null,
      zIndex: "0",
      scale: 1,
      // our grid needs to measure the container width before we
      // make our children visible
      opacity: grid.columnWidth === 0 ? 0 : 1
    };
  };
}

/**
 * Update our springs when dragging
 * @param order
 * @param grid
 * @param originalIndex
 * @param currentIndex
 * @param delta
 * @param traverseIndex
 */

function getPositionsOnDrag(
  order: number[],
  grid: GridSettings,
  originalIndex: number,
  currentIndex: number,
  delta: [number, number],
  traverseIndex?: number | false | null
) {
  return (i: number) => {
    return i === originalIndex
      ? {
          ...getDragPosition(currentIndex, grid, delta[0], delta[1], false),
          immediate: true,
          zIndex: "1",
          scale: 1.1,
          opacity: 0.8,
          onRest: null
        }
      : {
          ...getPositionForIndex(order.indexOf(i), grid, traverseIndex),
          immediate: false,
          zIndex: "0",
          scale: 1,
          opacity: 1,
          onRest: null
        };
  };
}

/**
 * Update our springs upon release
 * @param order
 * @param grid
 * @param originalIndex
 * @param traverseIndex
 */

function getPositionsOnRelease(
  order: number[],
  grid: GridSettings,
  startIndex: number,
  traverse?: TraverseType,
  onRest?: Function
) {
  return (i: number) => {
    const isSourceIndex = traverse && traverse.sourceIndex === i;

    const shared = {
      immediate: false,
      zIndex: "0",
      scale: 1,
      opacity: 1
    };

    if (isSourceIndex) {
      return {
        ...shared,
        xy: [traverse!.rx, traverse!.ry],
        onRest: onRest
      };
    }

    const index = traverse
      ? i >= traverse!.sourceIndex
        ? i - 1
        : i
      : order.indexOf(i);

    return {
      ...getPositionForIndex(index, grid),
      ...shared,
      onRest:
        i === startIndex
          ? () => {
              console.log("UPDATE ORDER");
            }
          : null
    };
  };
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
