export interface GridSettings {
  boxesPerRow: number;
  rowHeight: number;
  columnWidth: number;
}

interface ChildRenderProps {
  grid: GridSettings;
  disabled: boolean;
  dragging: boolean;
}

export type ChildRender<T> = (
  item: T,
  i: number,
  props: ChildRenderProps
) => React.ReactNode;

/**
 * A traverse captures information about dragging a grid item
 * from one list to another.
 */

export interface TraverseType {
  sourceId: string;
  targetId: string;
  rx: number;
  ry: number;
  tx: number;
  ty: number;
  sourceIndex: number;
  targetIndex: number;
  execute?: boolean;
}
