export const move = (
  source: Array<any>,
  destination: Array<any>,
  droppableSource: number,
  droppableDestination: number
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);

  const [removed] = sourceClone.splice(droppableSource, 1);

  destClone.splice(droppableDestination, 0, removed);

  return [sourceClone, destClone];
};
