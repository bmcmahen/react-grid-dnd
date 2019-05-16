import * as React from "react";
import {
  StateType,
  useGestureResponder,
  ResponderEvent
} from "react-gesture-responder";
import { SpringValue, animated, interpolate, useSpring } from "react-spring";
import { ChildRender, GridSettings } from "./grid-types";

interface StyleProps {
  [x: string]: SpringValue<any>;
  xy: SpringValue<number[]>;
  zIndex: SpringValue<string>;
  scale: SpringValue<number>;
  opacity: SpringValue<number>;
}

type GridItemProps<T> = {
  item: T;
  grid: GridSettings;
  onMove: (state: StateType, x: number, y: number) => void;
  i: number;
  endTraverse: () => void;
  disableDrag?: boolean;
  onEnd: (state: StateType, x: number, y: number) => void;
  children: ChildRender<T>;
  dragging: boolean;
  top: number;
  left: number;
  /** values represent the starrt point where the item should mount */
  mountWithTraverseTarget?: [number, number];
};

export function GridItem<T>({
  item,
  top,
  left,
  children,
  i,
  dragging: isDragging,
  onMove,
  mountWithTraverseTarget,
  grid,
  disableDrag,
  endTraverse,
  onEnd
}: GridItemProps<T>) {
  const { columnWidth, rowHeight } = grid;
  const dragging = React.useRef(false);
  const startCoords = React.useRef([left, top]);

  const [styles, set] = useSpring(() => {
    if (mountWithTraverseTarget) {
      // this feels really brittle. unsure of a better
      // solution for now.
      return {
        xy: mountWithTraverseTarget,
        immediate: true,
        zIndex: "1",
        scale: 1.1,
        opacity: 0.8
      };

      endTraverse();
    }

    return {
      xy: [left, top],
      immediate: true,
      zIndex: "0",
      scale: 1,
      opacity: 1
    };
  });

  // handle move updates imperatively
  function handleMove(state: StateType, e: ResponderEvent) {
    const x = startCoords.current[0] + state.delta[0];
    const y = startCoords.current[1] + state.delta[1];
    set({
      xy: [x, y],
      zIndex: "1",
      immediate: true,
      opacity: 0.8,
      scale: 1.1
    });

    onMove(state, x, y);
  }

  // handle end of drag
  function handleEnd(state: StateType) {
    const x = startCoords.current[0] + state.delta[0];
    const y = startCoords.current[1] + state.delta[1];
    dragging.current = false;
    onEnd(state, x, y);
  }

  const { bind } = useGestureResponder(
    {
      onMoveShouldSet: state => {
        if (disableDrag) {
          return false;
        }

        startCoords.current = [left, top];
        dragging.current = true;
        return true;
      },
      onMove: handleMove,
      onTerminationRequest: () => {
        if (dragging.current) {
          return false;
        }

        return true;
      },
      onTerminate: handleEnd,
      onRelease: handleEnd
    },
    {
      enableMouse: true
    }
  );

  /**
   * Update our position when left or top
   * values change
   */

  React.useEffect(() => {
    if (!dragging.current) {
      set({
        xy: [left, top],
        zIndex: "0",
        opacity: 1,
        scale: 1,
        immediate: false
      });
    }
  }, [dragging.current, left, top]);

  return (
    <animated.div
      {...bind}
      style={{
        cursor: "grab",
        zIndex: styles.zIndex,
        position: "absolute",
        width: columnWidth + "px",
        opacity: styles.opacity,
        height: rowHeight + "px",
        boxSizing: "border-box",
        transform: interpolate(
          [styles.xy, styles.scale],
          (xy: any, s: any) =>
            `translate3d(${xy[0]}px, ${xy[1]}px, 0) scale(${s})`
        )
      }}
    >
      {children(item, i, {
        dragging: isDragging,
        disabled: !!disableDrag,
        grid
      })}
    </animated.div>
  );
}
