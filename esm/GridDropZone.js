import { __assign, __read, __rest } from "tslib";
import * as React from "react";
import { useMeasure } from "./use-measure";
import { GridContext } from "./GridContext";
import { swap } from "./swap";
import { getPositionForIndex, getTargetIndex } from "./helpers";
import { GridItemContext } from "./GridItemContext";
export function GridDropZone(_a) {
    var id = _a.id, boxesPerRow = _a.boxesPerRow, children = _a.children, style = _a.style, _b = _a.disableDrag, disableDrag = _b === void 0 ? false : _b, _c = _a.disableDrop, disableDrop = _c === void 0 ? false : _c, rowHeight = _a.rowHeight, other = __rest(_a, ["id", "boxesPerRow", "children", "style", "disableDrag", "disableDrop", "rowHeight"]);
    var _d = React.useContext(GridContext), traverse = _d.traverse, startTraverse = _d.startTraverse, endTraverse = _d.endTraverse, register = _d.register, measureAll = _d.measureAll, onChange = _d.onChange, remove = _d.remove, getActiveDropId = _d.getActiveDropId;
    var ref = React.useRef(null);
    var _e = useMeasure(ref), bounds = _e.bounds, remeasure = _e.remeasure;
    var _f = __read(React.useState(null), 2), draggingIndex = _f[0], setDraggingIndex = _f[1];
    var _g = __read(React.useState(null), 2), placeholder = _g[0], setPlaceholder = _g[1];
    var traverseIndex = traverse && !traverse.execute && traverse.targetId === id
        ? traverse.targetIndex
        : null;
    var grid = {
        columnWidth: bounds.width / boxesPerRow,
        boxesPerRow: boxesPerRow,
        rowHeight: rowHeight
    };
    var childCount = React.Children.count(children);
    /**
     * Register our dropzone with our grid context
     */
    React.useEffect(function () {
        register(id, {
            top: bounds.top,
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
            width: bounds.width,
            height: bounds.height,
            count: childCount,
            grid: grid,
            disableDrop: disableDrop,
            remeasure: remeasure
        });
    }, [childCount, disableDrop, bounds, id, grid]);
    /**
     * Unregister when unmounting
     */
    React.useEffect(function () {
        return function () { return remove(id); };
    }, [id]);
    // keep an initial list of our item indexes. We use this
    // when animating swap positions on drag events
    var itemsIndexes = React.Children.map(children, function (_, i) { return i; });
    return (React.createElement("div", __assign({ ref: ref, style: __assign({ position: "relative" }, style) }, other), grid.columnWidth === 0
        ? null
        : React.Children.map(children, function (child, i) {
            var isTraverseTarget = traverse &&
                traverse.targetId === id &&
                traverse.targetIndex === i;
            var order = placeholder
                ? swap(itemsIndexes, placeholder.startIndex, placeholder.targetIndex)
                : itemsIndexes;
            var pos = getPositionForIndex(order.indexOf(i), grid, traverseIndex);
            /**
             * Handle a child being dragged
             * @param state
             * @param x
             * @param y
             */
            function onMove(state, x, y) {
                if (!ref.current)
                    return;
                if (draggingIndex !== i) {
                    setDraggingIndex(i);
                }
                var targetDropId = getActiveDropId(id, x + grid.columnWidth / 2, y + grid.rowHeight / 2);
                if (targetDropId && targetDropId !== id) {
                    startTraverse(id, targetDropId, x, y, i);
                }
                else {
                    endTraverse();
                }
                var targetIndex = targetDropId !== id
                    ? childCount
                    : getTargetIndex(i, grid, childCount, state.delta[0], state.delta[1]);
                if (targetIndex !== i) {
                    if ((placeholder && placeholder.targetIndex !== targetIndex) ||
                        !placeholder) {
                        setPlaceholder({
                            targetIndex: targetIndex,
                            startIndex: i
                        });
                    }
                }
                else if (placeholder) {
                    setPlaceholder(null);
                }
            }
            /**
             * Handle drag end events
             */
            function onEnd(state, x, y) {
                var targetDropId = getActiveDropId(id, x + grid.columnWidth / 2, y + grid.rowHeight / 2);
                var targetIndex = targetDropId !== id
                    ? childCount
                    : getTargetIndex(i, grid, childCount, state.delta[0], state.delta[1]);
                // traverse?
                if (traverse) {
                    onChange(traverse.sourceId, traverse.sourceIndex, traverse.targetIndex, traverse.targetId);
                }
                else {
                    onChange(id, i, targetIndex);
                }
                setPlaceholder(null);
                setDraggingIndex(null);
            }
            function onStart() {
                measureAll();
            }
            return (React.createElement(GridItemContext.Provider, { value: {
                    top: pos.xy[1],
                    disableDrag: disableDrag,
                    endTraverse: endTraverse,
                    mountWithTraverseTarget: isTraverseTarget
                        ? [traverse.tx, traverse.ty]
                        : undefined,
                    left: pos.xy[0],
                    i: i,
                    onMove: onMove,
                    onEnd: onEnd,
                    onStart: onStart,
                    grid: grid,
                    dragging: i === draggingIndex
                } }, child));
        })));
}
