# react-grid-dnd

Grid style drag and drop, built with React.

## Features

- **Supports dragging between arbitrary number of lists**.
- **Built with [react-gesture-responder](https://github.com/bmcmahen/react-gesture-responder) to enable better control over gesture delegation.**
- **Disable drop targets or dragging altogether**
- **Animated with react-spring**

## Install

Install using yarn or npm.

```
yarn add react-grid-dnd
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
