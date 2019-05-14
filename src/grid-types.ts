export interface GridSettings {
  boxesPerRow: number;
  rowHeight: number;
  columnWidth: number;
}

export type ChildRender<T> = (item: T, i: number) => React.ReactNode;
