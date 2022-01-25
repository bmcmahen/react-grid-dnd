import * as React from "react";
import { StateType } from "react-gesture-responder";
import { GridSettings } from "./grid-types";
export interface GridItemContextType {
    top: number;
    disableDrag: boolean;
    endTraverse: () => void;
    mountWithTraverseTarget?: [number, number];
    left: number;
    i: number;
    onMove: (state: StateType, x: number, y: number) => void;
    onEnd: (state: StateType, x: number, y: number) => void;
    onStart: () => void;
    grid: GridSettings;
    dragging: boolean;
}
export declare const GridItemContext: React.Context<GridItemContextType | null>;
