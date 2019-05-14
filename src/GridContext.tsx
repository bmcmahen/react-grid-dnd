import * as React from "react";
import { Bounds } from "./use-measure";
import { GridSettings } from "./grid-types";
import { getIndexFromCoordinates, getPositionForIndex } from "./GridDropZone";

interface RegisterOptions extends Bounds {
  /** The number of documents in each grid */
  count: number;
  /** grid info (boxes per row) */
  grid: GridSettings;
}

/**
 * A traverse captures information about dragging a grid item
 * from one list to another.
 */

interface TraverseType {
  sourceId: string;
  targetId: string;
  rx: number;
  ry: number;
  sourceIndex: number;
  targetIndex: number;
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
  endTraverse: noop
});

interface GridContextProviderProps {
  children: React.ReactNode;
}

export function GridContextProvider({ children }: GridContextProviderProps) {
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
    const targetIndex = getIndexFromCoordinates(rx, ry, targetGrid, count);
    const {
      xy: [px, py]
    } = getPositionForIndex(targetIndex, targetGrid);
    const { x: dx, y: dy } = diffDropzones(sourceId, targetId);
    setTraverse({
      rx: px + dx,
      ry: py + dy,
      sourceId,
      targetId,
      sourceIndex,
      targetIndex
    });
  }

  /**
   * End any active traversals
   */

  function endTraverse() {
    setTraverse(null);
  }

  return (
    <GridContext.Provider
      value={{
        register,
        remove,
        getActiveDropId,
        startTraverse,
        traverse,
        endTraverse
      }}
    >
      {children}
    </GridContext.Provider>
  );
}
