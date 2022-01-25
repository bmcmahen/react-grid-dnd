import * as React from "react";
export interface Bounds {
    left: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
}
export declare function useMeasure(ref: React.RefObject<HTMLDivElement | null>): {
    bounds: Bounds;
    remeasure: () => void;
};
