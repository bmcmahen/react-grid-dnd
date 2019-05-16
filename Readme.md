# react-grid-dnd

Grid style drag and drop, built with React. See a live example on [codesandbox](https://codesandbox.io/embed/gracious-wozniak-kj9w8).

## Features

- **Supports dragging between arbitrary number of lists**.
- **Built with [react-gesture-responder](https://github.com/bmcmahen/react-gesture-responder) to enable better control over gesture delegation.**
- **Disable drop targets or dragging altogether**
- **Animated with react-spring**

## Install

Install `react-grid-dnd` and `react-gesture-responder` using yarn or npm.

```
yarn add react-grid-dnd react-gesture-responder
```

## Usage

```jsx
import { GridContextProvider, GridDropZone, swap } from "react-grid-dnd";

function Example() {
  const [items, setItems] = React.useState([]); // supply your own state

  // target id will only be set if dragging from one dropzone to another.
  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
    const nextState = swap(items, sourceIndex, targetIndex);
    setItems(nextState);
  }

  return (
    <GridContextProvider onChange={onChange}>
      <GridDropZone
        id="items"
        boxesPerRow={4}
        rowHeight={100}
        items={items}
        getKey={item => item.id}
        style={{ height: "400px" }}
      >
        {item => (
          <div
            style={{
              width: "100%",
              height: "100%"
            }}
          >
            Render your item here
          </div>
        )}
      </GridDropZone>
    </GridContextProvider>
  );
}
```

## Dragging between lists

You can see this example in action on [codesandbox](https://codesandbox.io/embed/gracious-wozniak-kj9w8).

```jsx
import { GridContextProvider, GridDropZone, swap, move } from "react-grid-dnd";

function App() {
  const [items, setItems] = React.useState({
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
    ]
  });

  function onChange(sourceId, sourceIndex, targetIndex, targetId) {
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
      <div className="container">
        <GridDropZone
          className="dropzone left"
          id="left"
          boxesPerRow={4}
          getKey={item => item.id}
          rowHeight={70}
          items={items.left}
        >
          {item => (
            <div className="grid-item">
              <div className="grid-item-content">
                {item.name[0].toUpperCase()}
              </div>
            </div>
          )}
        </GridDropZone>
        <GridDropZone
          className="dropzone right"
          id="right"
          boxesPerRow={4}
          getKey={item => item.id}
          rowHeight={70}
          items={items.right}
        >
          {item => (
            <div className="grid-item">
              <div className="grid-item-content">
                {item.name[0].toUpperCase()}
              </div>
            </div>
          )}
        </GridDropZone>
      </div>
    </GridContextProvider>
  );
}
```
