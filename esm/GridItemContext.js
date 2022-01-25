import * as React from "react";
var noop = function () {
    throw Error("GridItem must be used as a child of GridDropZone");
};
export var GridItemContext = React.createContext(null);
