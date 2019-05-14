import * as React from "react";
import {
  CallbackType,
  StateType,
  useGestureResponder
} from "react-gesture-responder";
import { SpringValue, animated, interpolate } from "react-spring";
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
  styles: StyleProps;
  children: ChildRender<T>;
};

export function GridItem<T>({
  styles,
  item,
  children,
  i,
  onMove,
  width,
  height,
  disableDrag,
  onEnd
}: GridItemProps<T>) {
  const dragging = React.useRef(false);

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

  return (
    <animated.div
      {...bind}
      style={{
        position: "absolute",
        width: width + "px",
        height: height + "px",
        zIndex: styles.zIndex,
        opacity: styles.opacity,
        boxSizing: "border-box",
        transform: interpolate(
          [styles.xy, styles.scale],
          (x: any, s) => `translate3d(${x[0]}px, ${x[1]}px, 0) scale(${s})`
        )
      }}
    >
      {children(item, i)}
    </animated.div>
  );
}
