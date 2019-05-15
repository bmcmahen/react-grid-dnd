import * as React from "react";
import { storiesOf } from "@storybook/react";
import { GridContext, GridDropZone, GridContextProvider } from "../src";

const move = (
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

function DragBetweenExample() {
  const [left, setLeft] = React.useState([
    { id: 1, name: "ben" },
    { id: 2, name: "joe" },
    { id: 3, name: "jason" },
    { id: 4, name: "chris" },
    { id: 5, name: "heather" },
    { id: 6, name: "Richard" }
  ]);
  const [right, setRight] = React.useState([
    { id: 7, name: "george" },
    { id: 8, name: "rupert" },
    { id: 9, name: "alice" },
    { id: 10, name: "katherine" },
    { id: 11, name: "pam" },
    { id: 12, name: "katie" }
  ]);

  function onChange(
    sourceId: string,
    sourceIndex: number,
    targetIndex: number,
    targetId?: string
  ) {
    if (sourceId === "left") {
      console.log("set", sourceId, sourceIndex, targetIndex, targetId);
      const [p, d] = move(left, right, sourceIndex, targetIndex);
      console.log("RIGHT", d);
      console.log("LEFT", p);
      setRight(d);
      setLeft(p);
    } else {
      console.log("set", sourceId, sourceIndex, targetIndex, targetId);
      const [d, p] = move(right, left, sourceIndex, targetIndex);
      setRight(d);
      setLeft(p);
    }
  }

  return (
    <GridContextProvider onChange={onChange}>
      <div
        style={{
          display: "flex",
          height: "400px",
          border: "1px solid red"
        }}
      >
        <GridDropZone
          style={{
            flex: 1,
            height: "400px",
            border: "1px solid black"
          }}
          id="left"
          boxesPerRow={4}
          rowHeight={100}
          items={left}
        >
          {item => {
            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                  background: "green",
                  border: "1px solid black"
                }}
              >
                {item.name}
              </div>
            );
          }}
        </GridDropZone>

        <GridDropZone
          style={{
            flex: 1,
            height: "400px",
            border: "1px solid blue"
          }}
          id="right"
          boxesPerRow={4}
          rowHeight={100}
          items={right}
        >
          {item => {
            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                  background: "red",
                  border: "1px solid black"
                }}
              >
                {item.name}
              </div>
            );
          }}
        </GridDropZone>
      </div>
    </GridContextProvider>
  );
}

storiesOf("Hello", module).add("Drag between", () => <DragBetweenExample />);
