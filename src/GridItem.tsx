import * as React from "react";
import {
  CallbackType,
  StateType,
  useGestureResponder,
  ResponderEvent
} from "react-gesture-responder";
import { SpringValue, animated, interpolate, useSpring } from "react-spring";
import { ChildRender, GridSettings } from "./grid-types";
import { getDragPosition } from "./helpers";

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
  disableDrag?: boolean;
  onEnd: (state: StateType, x: number, y: number) => void;
  children: ChildRender<T>;
  dragging: boolean;
  top: number;
  left: number;
  mountWithTraverseTarget?: [number, number];
};

export function GridItem<T>({
  item,
  top,
  left,
  children,
  i,
  onMove,
  mountWithTraverseTarget,
  grid,
  disableDrag,
  onEnd
}: GridItemProps<T>) {
  const { columnWidth, rowHeight } = grid;
  const dragging = React.useRef(false);
  const startCoords = React.useRef([left, top]);

  const [styles, set] = useSpring(() => ({
    xy: mountWithTraverseTarget || [left, top],
    immediate: true,
    zIndex: mountWithTraverseTarget ? "1" : "0"
  }));

  // handle move updates imperatively
  function handleMove(state: StateType, e: ResponderEvent) {
    const x = startCoords.current[0] + state.delta[0];
    const y = startCoords.current[1] + state.delta[1];
    set({
      xy: [x, y],
      zIndex: "1",
      immediate: true
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

  React.useEffect(() => {
    if (!dragging.current) {
      set({
        xy: [left, top],
        zIndex: "0",
        immediate: false
      });
    }
  }, [dragging.current, left, top]);

  return (
    <animated.div
      {...bind}
      style={{
        zIndex: styles.zIndex,
        position: "absolute",
        width: columnWidth + "px",
        height: rowHeight + "px",
        boxSizing: "border-box",
        transform: interpolate(
          styles.xy,
          (x, y) => `translate3d(${x}px, ${y}px, 0)`
        )
      }}
    >
      {children(item, i)}
    </animated.div>
  );
}
