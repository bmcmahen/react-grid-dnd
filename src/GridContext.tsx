import * as React from "react";
import { Bounds } from "./use-measure";
import { GridSettings, TraverseType } from "./grid-types";
import { getPositionForIndex, getIndexFromCoordinates } from "./helpers";
import { move } from "./move";

interface RegisterOptions extends Bounds {
  /** The number of documents in each grid */
  count: number;
  /** grid info (boxes per row) */
  grid: GridSettings;
  /** whether the dropzone is disabled for dropping */
  disableDrop: boolean;
}

interface GridContextType {
  register: (id: string, options: RegisterOptions) => void;
  remove: (id: string) => void;
  getActiveDropId: (sourceId: string, x: number, y: number) => string | null;
  startTraverse: (
    sourceId: string,
    targetId: string,
    x: number,
    y: number,
    sourceIndex: number
  ) => void;
  traverse: TraverseType | null;
  endTraverse: () => void;
  onChange: (
    sourceId: string,
    sourceIndex: number,
    targetIndex: number,
    targetId?: string
  ) => void;
}

const noop = () => {
  throw new Error(
    "Make sure that you have wrapped your drop zones with GridContext"
  );
};

export const GridContext = React.createContext<GridContextType>({
  register: noop,
  remove: noop,
  getActiveDropId: noop,
  startTraverse: noop,
  traverse: null,
  endTraverse: noop,
  onChange: noop
});

interface GridContextProviderProps {
  children: React.ReactNode;
  onChange: (
    sourceId: string,
    sourceIndex: number,
    targetIndex: number,
    targetId?: string
  ) => void;
}

// interface ChangeOptions {
//   sourceId: string;
//   sourceIndex: number;
//   targetIndex: number;
//   targetId?: string;
// }

// type Action<K, V = void> = V extends void ? { type: K } : { type: K } & V;

// export type ActionType<T> =
//   | Action<"UPDATE_LIST", { value: GridItemType<T> }>
//   | Action<"CHANGE_LIST", { value: ChangeOptions }>
//   | Action<"SET_TRAVERSE", { value: TraverseType | null }>
//   | Action<"END_TRAVERSE">
//   | Action<"SET_PLACEHOLDER", { value: any }>
//   | Action<"UNSET_PLACEHOLDER", { value: any }>;

// type GridItemType<T> = {
//   [key: string]: Array<T>;
// };

// type StateType<T> = {
//   traverse: TraverseType | null;
//   grids: GridItemType<T>;
// };

// function reducer<T>(state: StateType<T>, action: ActionType<T>) {
//   switch (action.type) {
//     case "UPDATE_LIST":
//       return {
//         ...state,
//         ...action.value
//       };
//     case "CHANGE_LIST": {
//       // perform a traversal
//       if (action.value.targetId) {
//         const sourceList = state.grids[action.value.sourceId];
//         const targetList = state.grids[action.value.targetId];
//         const [source, target] = move(
//           sourceList,
//           targetList,
//           action.value.sourceIndex,
//           action.value.targetIndex
//         );
//         return {
//           ...state,
//           traversal: {
//             ...state.traverse,
//             execute: true
//           },
//           grids: {
//             ...state.grids,
//             [action.value.sourceId]: source,
//             [action.value.targetId]: target
//           }
//         };
//       }

//       // perform regular change

//       return {
//         ...state,
//         traverse: null
//       };
//     }
//   }
// }

export function GridContextProvider({
  children,
  onChange
}: GridContextProviderProps) {
  const [traverse, setTraverse] = React.useState<TraverseType | null>(null);
  const dropRefs = React.useRef<Map<string, RegisterOptions>>(new Map());

  /**
   * Register a drop zone with relevant information
   * @param id
   * @param options
   */

  function register(id: string, options: RegisterOptions) {
    dropRefs.current.set(id, options);
  }

  /**
   * Remove a drop zone (typically on unmount)
   * @param id
   */

  function remove(id: string) {
    dropRefs.current.delete(id);
  }

  /**
   * Determine the fixed position (pageX) of an item
   * @param sourceId
   * @param rx relative x
   * @param ry relative y
   */

  function getFixedPosition(sourceId: string, rx: number, ry: number) {
    const { left, top } = dropRefs.current.get(sourceId)!;
    return {
      x: left + rx,
      y: top + ry
    };
  }

  /**
   * Get a relative position for a target dropzone given
   * a fixed position
   * @param targetId
   * @param fx fixed x
   * @param fy fixed y
   */

  function getRelativePosition(targetId: string, fx: number, fy: number) {
    const { left, top } = dropRefs.current.get(targetId)!;
    return {
      x: fx - left,
      y: fy - top
    };
  }

  /**
   * Determine the difference in coordinates between
   * two dropzones
   * @param sourceId
   * @param targetId
   */

  function diffDropzones(sourceId: string, targetId: string) {
    const sBounds = dropRefs.current.get(sourceId)!;
    const tBounds = dropRefs.current.get(targetId)!;

    return {
      x: tBounds.left - sBounds.left,
      y: tBounds.top - sBounds.top
    };
  }

  /**
   * Determine which dropzone we are actively dragging over
   * @param sourceId
   * @param x
   * @param y
   */

  function getActiveDropId(sourceId: string, x: number, y: number) {
    const { x: fx, y: fy } = getFixedPosition(sourceId, x, y);

    // probably faster just using an array for dropRefs
    for (const [key, bounds] of dropRefs.current.entries()) {
      if (
        !bounds.disableDrop &&
        fx > bounds.left &&
        fx < bounds.right &&
        fy > bounds.top &&
        fy < bounds.bottom
      ) {
        return key;
      }
    }

    return null;
  }

  /**
   * Trigger a traversal (when one item is being dropped
   * on a different dropzone)
   * @param sourceId
   * @param targetId
   * @param x
   * @param y
   * @param sourceIndex
   */

  function startTraverse(
    sourceId: string,
    targetId: string,
    x: number,
    y: number,
    sourceIndex: number
  ) {
    const { x: fx, y: fy } = getFixedPosition(sourceId, x, y);
    const { x: rx, y: ry } = getRelativePosition(targetId, fx, fy);
    const { grid: targetGrid, count } = dropRefs.current.get(targetId)!;
    const targetIndex = getIndexFromCoordinates(
      rx + targetGrid.columnWidth / 2,
      ry + targetGrid.rowHeight / 2,
      targetGrid,
      count
    );
    const {
      xy: [px, py]
    } = getPositionForIndex(targetIndex, targetGrid);
    const { x: dx, y: dy } = diffDropzones(sourceId, targetId);

    // only update traverse if targetId or targetIndex have changed
    if (
      !traverse ||
      !(
        traverse &&
        traverse.targetIndex !== targetIndex &&
        traverse.targetId !== targetId
      )
    ) {
      setTraverse({
        rx: px + dx,
        ry: py + dy,
        tx: rx,
        ty: ry,
        sourceId,
        targetId,
        sourceIndex,
        targetIndex
      });
    }
  }

  /**
   * End any active traversals
   */

  function endTraverse() {
    setTraverse(null);
  }

  /**
   * Perform a change to list item arrays.
   * If it doesn't include targetId, it's a switch
   * of order within the one array itself.
   */

  function onSwitch(
    sourceId: string,
    sourceIndex: number,
    targetIndex: number,
    targetId?: string
  ) {
    setTraverse({
      ...traverse!,
      execute: true
    });
    onChange(sourceId, sourceIndex, targetIndex, targetId);
  }

  return (
    <GridContext.Provider
      value={{
        register,
        remove,
        getActiveDropId,
        startTraverse,
        traverse,
        endTraverse,
        onChange: onSwitch
      }}
    >
      {children}
    </GridContext.Provider>
  );
}
