import * as React from "react";
import { storiesOf } from "@storybook/react";
import {
  GridContext,
  GridDropZone,
  GridContextProvider,
  swap,
  move
} from "../src";

import { GridItem } from "../src/GridItem";

interface AppState {
  [key: string]: Array<{
    name: string;
    id: number;
  }>;
}

function DragBetweenExample({ single }: any) {
  const [mounted, setMounted] = React.useState(false);
  const [items, setItems] = React.useState<AppState>({
    left: [
      { id: 1, name: "ben" },
      { id: 2, name: "joe" },
      { id: 3, name: "jason" },
      { id: 4, name: "chris" },
      { id: 5, name: "heather" },
      { id: 6, name: "Richard" }
    ],
    right: [
      { id: 7, name: "george" },
      { id: 8, name: "rupert" },
      { id: 9, name: "alice" },
      { id: 10, name: "katherine" },
      { id: 11, name: "pam" },
      { id: 12, name: "katie" }
    ],
    dock: [{ id: 13, name: "Whatever" }]
  });

  React.useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 500);
  }, []);
  function onChange(
    sourceId: any,
    sourceIndex: number,
    targetIndex: number,
    targetId?: string
  ) {
    if (targetId) {
      const result = move(
        items[sourceId],
        items[targetId],
        sourceIndex,
        targetIndex
      );
      return setItems({
        ...items,
        [sourceId]: result[0],
        [targetId]: result[1]
      });
    }

    const result = swap(items[sourceId], sourceIndex, targetIndex);
    return setItems({
      ...items,
      [sourceId]: result
    });
  }

  return (
    <GridContextProvider onChange={onChange}>
      <div
        style={{
          display: "flex",
          touchAction: "none"
        }}
      >
        <div
          style={{
            transform: mounted ? `translateX(-100px)` : `translateX(0)`,
            transition: "transform 0.25s ease",
            width: "600px",
            display: "flex",
            border: "1px solid blue"
          }}
        >
          <GridDropZone
            style={{
              flex: "0 0 auto",
              height: "400px",
              width: "400px",
              border: "1px solid #bbb",
              borderRadius: "1rem",
              marginRight: "10px",
              touchAction: "none"
            }}
            id="left"
            boxesPerRow={4}
            rowHeight={70}
          >
            {items.left.map(item => (
              <GridItem key={item.name}>
                <div
                  style={{
                    padding: "10px",
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box"
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      boxSizing: "border-box",
                      background: "#08e",
                      display: "flex",
                      justifyContent: "center",
                      color: "white",
                      fontFamily: "helvetica",
                      alignItems: "center",
                      borderRadius: "50%"
                    }}
                  >
                    {item.name[0].toUpperCase()}
                  </div>
                </div>
              </GridItem>
            ))}
          </GridDropZone>

          {!single && (
            <GridDropZone
              style={{
                flex: "0 0 auto",
                height: "400px",

                width: "400px",
                border: "1px solid #bbb",
                borderRadius: "1rem",
                marginLeft: "10px",
                touchAction: "none"
              }}
              id="right"
              boxesPerRow={4}
              rowHeight={70}
            >
              {items.right.map(item => (
                <GridItem key={item.name}>
                  {(Component: any, props: any) => (
                    <Component {...props}>
                      <div
                        style={{
                          padding: "10px",
                          width: "100%",
                          height: "100%",
                          boxSizing: "border-box"
                        }}
                      >
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            boxSizing: "border-box",
                            background: "#08e",
                            display: "flex",
                            justifyContent: "center",
                            color: "white",
                            fontFamily: "helvetica",
                            alignItems: "center",
                            borderRadius: "50%"
                          }}
                        >
                          {item.name[0].toUpperCase()}
                        </div>
                      </div>
                    </Component>
                  )}
                </GridItem>
              ))}
            </GridDropZone>
          )}
        </div>
      </div>

      <GridDropZone
        style={{
          flex: "0 0 auto",
          height: "200px",
          width: "400px",
          border: "1px solid red",
          borderRadius: "1rem",
          marginRight: "10px",
          touchAction: "none"
        }}
        id="dock"
        boxesPerRow={4}
        rowHeight={70}
      >
        {items.dock.map(item => (
          <GridItem key={item.name}>
            <div
              style={{
                padding: "10px",
                width: "100%",
                height: "100%",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  boxSizing: "border-box",
                  background: "#08e",
                  display: "flex",
                  justifyContent: "center",
                  color: "white",
                  fontFamily: "helvetica",
                  alignItems: "center",
                  borderRadius: "50%"
                }}
              >
                {item.name[0].toUpperCase()}
              </div>
            </div>
          </GridItem>
        ))}
      </GridDropZone>
    </GridContextProvider>
  );
}

storiesOf("Hello", module)
  .add("Drag between", () => <DragBetweenExample />)
  .add("single", () => {
    return <DragBetweenExample single />;
  })
  .add("supports parents transforming", () => (
    <div>
      <TransformExample />
    </div>
  ))
  .add("readme example", () => <ReadmeExample />);

function TransformExample() {
  const [transform, setTransform] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setTransform(true);
    }, 2000);
  }, []);

  return (
    <div
      style={{
        transform: transform ? "translateX(-30%)" : "translateX(0)",
        transition: "transform 0.25s ease"
      }}
    >
      <DragBetweenExample />
    </div>
  );
}

function ReadmeExample() {
  const [items, setItems] = React.useState([1, 2, 3, 4]); // supply your own state

  // target id will only be set if dragging from one dropzone to another.
  function onChange(
    sourceId: any,
    sourceIndex: any,
    targetIndex: any,
    targetId: any
  ) {
    const nextState = swap(items, sourceIndex, targetIndex);
    setItems(nextState);
  }

  return (
    <GridContextProvider onChange={onChange}>
      <GridDropZone
        id="items"
        boxesPerRow={4}
        rowHeight={100}
        style={{ height: "400px" }}
      >
        {items.map((item: any) => (
          <GridItem key={item}>
            <div
              style={{
                width: "100%",
                height: "100%"
              }}
            >
              {item}
            </div>
          </GridItem>
        ))}
      </GridDropZone>
    </GridContextProvider>
  );
}
