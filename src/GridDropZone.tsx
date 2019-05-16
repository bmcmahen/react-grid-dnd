import * as React from "react";
import { StateType } from "react-gesture-responder";
import { useMeasure } from "./use-measure";
import { GridContext } from "./GridContext";
import { GridSettings, ChildRender } from "./grid-types";
import { GridItem } from "./GridItem";
import swap from "./swap";
import { getPositionForIndex, getTargetIndex } from "./helpers";

type GridDropZoneProps<T> = {
  items: T[];
  boxesPerRow: number;
  rowHeight: number;
  id: string;
  getKey: (item: T) => string | number;
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
  getKey,
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
    traverse && !traverse.execute && traverse.targetId === id
      ? traverse.targetIndex
      : null;

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
  }, [items, disableDrop, bounds, id, grid]);

  /**
   * Unregister when unmounting
   */

  React.useEffect(() => {
    return () => remove(id);
  }, [id]);

  // keep an initial list of our item indexes. We use this
  // when animating swap positions on drag events
  const itemsIndexes = items.map((_, i) => i);

  return (
    <div ref={ref} {...other}>
      {grid.columnWidth === 0
        ? null
        : items.map((item: any, i) => {
            const isTraverseTarget =
              traverse &&
              traverse.targetId === id &&
              traverse.targetIndex === i;

            const order = placeholder
              ? swap(
                  itemsIndexes,
                  placeholder.startIndex,
                  placeholder.targetIndex
                )
              : itemsIndexes;

            const pos = getPositionForIndex(
              order.indexOf(i),
              grid,
              traverseIndex
            );

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
             * Handle drag end events
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
                key={getKey(item)}
                item={item}
                top={pos.xy[1]}
                disableDrag={disableDrag}
                endTraverse={endTraverse}
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
