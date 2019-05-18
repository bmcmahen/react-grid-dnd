export function move<T>(
  source: Array<T>,
  destination: Array<T>,
  droppableSource: number,
  droppableDestination: number
) {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource, 1);
  destClone.splice(droppableDestination, 0, removed);
  return [sourceClone, destClone];
}
