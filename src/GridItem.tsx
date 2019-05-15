import * as React from "react";
import {
  CallbackType,
  StateType,
  useGestureResponder
} from "react-gesture-responder";
import { SpringValue, animated, interpolate, useSpring } from "react-spring";
import { ChildRender } from "./grid-types";

interface StyleProps {
  [x: string]: SpringValue<any>;
  xy: SpringValue<number[]>;
  zIndex: SpringValue<string>;
  scale: SpringValue<number>;
  opacity: SpringValue<number>;
}

type GridItemProps<T> = {
  item: T;
  width: number;
  height: number;
  onMove: CallbackType;
  i: number;
  disableDrag?: boolean;
  onEnd: (state: StateType) => void;
  children: ChildRender<T>;
  top: number;
  left: number;
};

export function GridItem<T>({
  item,
  top,
  left,
  children,
  i,
  onMove,
  width,
  height,
  disableDrag,
  onEnd
}: GridItemProps<T>) {
  const dragging = React.useRef(false);

  const [styles, set] = useSpring(() => ({
    xy: [left, top]
  }));

  const { bind } = useGestureResponder(
    {
      onMoveShouldSet: () => {
        if (disableDrag) {
          return false;
        }

        dragging.current = true;
        return true;
      },
      onMove,
      onTerminationRequest: () => {
        if (dragging.current) {
          return false;
        }

        return true;
      },
      onTerminate: state => {
        dragging.current = false;
        onEnd(state);
      },
      onRelease: state => {
        dragging.current = false;
        onEnd(state);
      }
    },
    {
      enableMouse: true
    }
  );

  React.useEffect(() => {
    set({
      xy: [left, top]
    });
  }, [left, top]);

  return (
    <animated.div
      {...bind}
      style={{
        position: "absolute",
        width: width + "px",
        height: height + "px",
        boxSizing: "border-box",
        transform: interpolate(
          [styles.xy],
          (x: any) => `translate3d(${x[0]}px, ${x[1]}px, 0)`
        )
      }}
    >
      {children(item, i)}
    </animated.div>
  );
}
