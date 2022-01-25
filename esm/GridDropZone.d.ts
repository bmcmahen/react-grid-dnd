import * as React from "react";
export interface GridDropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
    boxesPerRow: number;
    rowHeight: number;
    id: string;
    children: React.ReactNodeArray;
    disableDrag?: boolean;
    disableDrop?: boolean;
    style?: React.CSSProperties;
}
export declare function GridDropZone({ id, boxesPerRow, children, style, disableDrag, disableDrop, rowHeight, ...other }: GridDropZoneProps): JSX.Element;
