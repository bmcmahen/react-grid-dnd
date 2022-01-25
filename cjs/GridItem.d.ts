import * as React from "react";
interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    disabled?: boolean;
}
export declare function GridItem({ children, style, className, disabled, ...other }: GridItemProps): any;
export {};
