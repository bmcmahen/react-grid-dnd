import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";

export interface Bounds {
  left: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
}

export function useMeasure(ref: React.RefObject<HTMLDivElement | null>) {
  const [bounds, setBounds] = React.useState<Bounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    right: 0,
    bottom: 0
  });

  const [observer] = React.useState(
    () =>
      new ResizeObserver(([entry]) => {
        setBounds(entry.target.getBoundingClientRect());
      })
  );

  React.useLayoutEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [ref, observer]);

  function remeasure() {
    setBounds(ref.current!.getBoundingClientRect());
  }

  return { bounds, remeasure };
}
