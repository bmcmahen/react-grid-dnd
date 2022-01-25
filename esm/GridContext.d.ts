import * as React from "react";
import { Bounds } from "./use-measure";
import { GridSettings, TraverseType } from "./grid-types";
interface RegisterOptions extends Bounds {
    /** The number of documents in each grid */
    count: number;
    /** grid info (boxes per row) */
    grid: GridSettings;
    /** whether the dropzone is disabled for dropping */
    disableDrop: boolean;
    remeasure: () => void;
}
interface GridContextType {
    register: (id: string, options: RegisterOptions) => void;
    remove: (id: string) => void;
    measureAll: () => void;
    getActiveDropId: (sourceId: string, x: number, y: number) => string | null;
    startTraverse: (sourceId: string, targetId: string, x: number, y: number, sourceIndex: number) => void;
    traverse: TraverseType | null;
    endTraverse: () => void;
    onChange: (sourceId: string, sourceIndex: number, targetIndex: number, targetId?: string) => void;
}
export declare const GridContext: React.Context<GridContextType>;
interface GridContextProviderProps {
    children: React.ReactNode;
    onChange: (sourceId: string, sourceIndex: number, targetIndex: number, targetId?: string) => void;
}
export declare function GridContextProvider({ children, onChange }: GridContextProviderProps): JSX.Element;
export {};
