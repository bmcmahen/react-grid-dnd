'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var tslib = require('tslib');
var React = require('react');
var ResizeObserver = _interopDefault(require('resize-observer-polyfill'));
var reactGestureResponder = require('react-gesture-responder');
var reactSpring = require('react-spring');

/**
 * Get the active drag position given its initial
 * coordinates and grid meta
 * @param index
 * @param grid
 * @param dx
 * @param dy
 */
function getDragPosition(index, grid, dx, dy, center) {
    var _a = tslib.__read(getPositionForIndex(index, grid).xy, 2), left = _a[0], top = _a[1];
    return {
        xy: [
            left + dx + (center ? grid.columnWidth / 2 : 0),
            top + dy + (center ? grid.rowHeight / 2 : 0)
        ]
    };
}
/**
 * Get the relative top, left position for a particular
 * index in a grid
 * @param i
 * @param grid
 * @param traverseIndex (destination for traverse)
 */
function getPositionForIndex(i, _a, traverseIndex) {
    var boxesPerRow = _a.boxesPerRow, rowHeight = _a.rowHeight, columnWidth = _a.columnWidth;
    var index = typeof traverseIndex == "number" ? (i >= traverseIndex ? i + 1 : i) : i;
    var x = (index % boxesPerRow) * columnWidth;
    var y = Math.floor(index / boxesPerRow) * rowHeight;
    return {
        xy: [x, y]
    };
}
/**
 * Given relative coordinates, determine which index
 * we are currently in
 * @param x
 * @param y
 * @param param2
 */
function getIndexFromCoordinates(x, y, _a, count) {
    var rowHeight = _a.rowHeight, boxesPerRow = _a.boxesPerRow, columnWidth = _a.columnWidth;
    var index = Math.floor(y / rowHeight) * boxesPerRow + Math.floor(x / columnWidth);
    return index >= count ? count : index;
}
/**
 * Get the target index during a drag
 * @param startIndex
 * @param grid
 * @param count
 * @param dx
 * @param dy
 */
function getTargetIndex(startIndex, grid, count, dx, dy) {
    var _a = tslib.__read(getDragPosition(startIndex, grid, dx, dy, true).xy, 2), cx = _a[0], cy = _a[1];
    return getIndexFromCoordinates(cx, cy, grid, count);
}

var noop = function () {
    throw new Error("Make sure that you have wrapped your drop zones with GridContext");
};
var GridContext = React.createContext({
    register: noop,
    remove: noop,
    getActiveDropId: noop,
    startTraverse: noop,
    measureAll: noop,
    traverse: null,
    endTraverse: noop,
    onChange: noop
});
function GridContextProvider(_a) {
    var children = _a.children, onChange = _a.onChange;
    var _b = tslib.__read(React.useState(null), 2), traverse = _b[0], setTraverse = _b[1];
    var dropRefs = React.useRef(new Map());
    /**
     * Register a drop zone with relevant information
     * @param id
     * @param options
     */
    function register(id, options) {
        dropRefs.current.set(id, options);
    }
    /**
     * Remove a drop zone (typically on unmount)
     * @param id
     */
    function remove(id) {
        dropRefs.current.delete(id);
    }
    /**
     * Determine the fixed position (pageX) of an item
     * @param sourceId
     * @param rx relative x
     * @param ry relative y
     */
    function getFixedPosition(sourceId, rx, ry) {
        var item = dropRefs.current.get(sourceId);
        // When items are removed from the DOM, the left and top values could be undefined.
        if (!item) {
            return {
                x: rx,
                y: ry
            };
        }
        var left = item.left, top = item.top;
        return {
            x: left + rx,
            y: top + ry
        };
    }
    /**
     * Get a relative position for a target dropzone given
     * a fixed position
     * @param targetId
     * @param fx fixed x
     * @param fy fixed y
     */
    function getRelativePosition(targetId, fx, fy) {
        var _a = dropRefs.current.get(targetId), left = _a.left, top = _a.top;
        return {
            x: fx - left,
            y: fy - top
        };
    }
    /**
     * Determine the difference in coordinates between
     * two dropzones
     * @param sourceId
     * @param targetId
     */
    function diffDropzones(sourceId, targetId) {
        var sBounds = dropRefs.current.get(sourceId);
        var tBounds = dropRefs.current.get(targetId);
        return {
            x: tBounds.left - sBounds.left,
            y: tBounds.top - sBounds.top
        };
    }
    /**
     * Determine which dropzone we are actively dragging over
     * @param sourceId
     * @param x
     * @param y
     */
    function getActiveDropId(sourceId, x, y) {
        var e_1, _a;
        var _b = getFixedPosition(sourceId, x, y), fx = _b.x, fy = _b.y;
        try {
            // probably faster just using an array for dropRefs
            for (var _c = tslib.__values(dropRefs.current.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = tslib.__read(_d.value, 2), key = _e[0], bounds = _e[1];
                if (!bounds.disableDrop &&
                    fx > bounds.left &&
                    fx < bounds.right &&
                    fy > bounds.top &&
                    fy < bounds.bottom) {
                    return key;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    /**
     * Trigger a traversal (when one item is being dropped
     * on a different dropzone)
     * @param sourceId
     * @param targetId
     * @param x
     * @param y
     * @param sourceIndex
     */
    function startTraverse(sourceId, targetId, x, y, sourceIndex) {
        var _a = getFixedPosition(sourceId, x, y), fx = _a.x, fy = _a.y;
        var _b = getRelativePosition(targetId, fx, fy), rx = _b.x, ry = _b.y;
        var _c = dropRefs.current.get(targetId), targetGrid = _c.grid, count = _c.count;
        var targetIndex = getIndexFromCoordinates(rx + targetGrid.columnWidth / 2, ry + targetGrid.rowHeight / 2, targetGrid, count);
        var _d = tslib.__read(getPositionForIndex(targetIndex, targetGrid).xy, 2), px = _d[0], py = _d[1];
        var _e = diffDropzones(sourceId, targetId), dx = _e.x, dy = _e.y;
        // only update traverse if targetId or targetIndex have changed
        if (!traverse ||
            !(traverse &&
                traverse.targetIndex !== targetIndex &&
                traverse.targetId !== targetId)) {
            setTraverse({
                rx: px + dx,
                ry: py + dy,
                tx: rx,
                ty: ry,
                sourceId: sourceId,
                targetId: targetId,
                sourceIndex: sourceIndex,
                targetIndex: targetIndex
            });
        }
    }
    /**
     * End any active traversals
     */
    function endTraverse() {
        setTraverse(null);
    }
    /**
     * Perform a change to list item arrays.
     * If it doesn't include targetId, it's a switch
     * of order within the one array itself.
     */
    function onSwitch(sourceId, sourceIndex, targetIndex, targetId) {
        // this is a bit hacky, but seems to work for now. The idea
        // is that we want our newly mounted traversed grid item
        // to start its animation from the last target location.
        // Execute informs our GridDropZone to remove the placeholder
        // but to pass the initial location to the newly mounted
        // grid item at the specified index.
        // The problem here is that it's async, so potentially something
        // could mount in its place in between setTraversal and onChange
        // executing. Or maybe onChange won't do anything, in which case
        // our state is kinda messed up.
        // So it's sorta a controlled component, but not really, because
        // if you don't do what we suggest, then it gets messed up.
        // One solution is to bring the state in-component and force
        // the state to be updated by us, since it's basically required
        // anyway.
        // We could possibly also use a unique identifier for the grid (besides
        // the index). This could still result in weirdness, but would
        // be more unlikely.
        // Ultimately it's kinda messed because we are trying to do something
        // imperative in a declarative interface.
        setTraverse(tslib.__assign(tslib.__assign({}, traverse), { execute: true }));
        onChange(sourceId, sourceIndex, targetIndex, targetId);
    }
    function measureAll() {
        dropRefs.current.forEach(function (ref) {
            ref.remeasure();
        });
    }
    return (React.createElement(GridContext.Provider, { value: {
            register: register,
            remove: remove,
            getActiveDropId: getActiveDropId,
            startTraverse: startTraverse,
            traverse: traverse,
            measureAll: measureAll,
            endTraverse: endTraverse,
            onChange: onSwitch
        } }, children));
}

function useMeasure(ref) {
    var _a = tslib.__read(React.useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0
    }), 2), bounds = _a[0], setBounds = _a[1];
    var _b = tslib.__read(React.useState(function () {
        return new ResizeObserver(function (_a) {
            var _b = tslib.__read(_a, 1), entry = _b[0];
            setBounds(entry.target.getBoundingClientRect());
        });
    }), 1), observer = _b[0];
    React.useLayoutEffect(function () {
        if (ref.current) {
            observer.observe(ref.current);
        }
        return function () { return observer.disconnect(); };
    }, [ref, observer]);
    function remeasure() {
        setBounds(ref.current.getBoundingClientRect());
    }
    return { bounds: bounds, remeasure: remeasure };
}

function swap(array, moveIndex, toIndex) {
    /* #move - Moves an array item from one position in an array to another.
       Note: This is a pure function so a new array will be returned, instead
       of altering the array argument.
      Arguments:
      1. array     (String) : Array in which to move an item.         (required)
      2. moveIndex (Object) : The index of the item to move.          (required)
      3. toIndex   (Object) : The index to move item at moveIndex to. (required)
    */
    var item = array[moveIndex];
    var length = array.length;
    var diff = moveIndex - toIndex;
    if (diff > 0) {
        // move left
        return tslib.__spread(array.slice(0, toIndex), [
            item
        ], array.slice(toIndex, moveIndex), array.slice(moveIndex + 1, length));
    }
    else if (diff < 0) {
        // move right
        var targetIndex = toIndex + 1;
        return tslib.__spread(array.slice(0, moveIndex), array.slice(moveIndex + 1, targetIndex), [
            item
        ], array.slice(targetIndex, length));
    }
    return array;
}

var GridItemContext = React.createContext(null);

function GridDropZone(_a) {
    var id = _a.id, boxesPerRow = _a.boxesPerRow, children = _a.children, style = _a.style, _b = _a.disableDrag, disableDrag = _b === void 0 ? false : _b, _c = _a.disableDrop, disableDrop = _c === void 0 ? false : _c, rowHeight = _a.rowHeight, other = tslib.__rest(_a, ["id", "boxesPerRow", "children", "style", "disableDrag", "disableDrop", "rowHeight"]);
    var _d = React.useContext(GridContext), traverse = _d.traverse, startTraverse = _d.startTraverse, endTraverse = _d.endTraverse, register = _d.register, measureAll = _d.measureAll, onChange = _d.onChange, remove = _d.remove, getActiveDropId = _d.getActiveDropId;
    var ref = React.useRef(null);
    var _e = useMeasure(ref), bounds = _e.bounds, remeasure = _e.remeasure;
    var _f = tslib.__read(React.useState(null), 2), draggingIndex = _f[0], setDraggingIndex = _f[1];
    var _g = tslib.__read(React.useState(null), 2), placeholder = _g[0], setPlaceholder = _g[1];
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
    return (React.createElement("div", tslib.__assign({ ref: ref, style: tslib.__assign({ position: "relative" }, style) }, other), grid.columnWidth === 0
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

function move(source, destination, droppableSource, droppableDestination) {
    var sourceClone = Array.from(source);
    var destClone = Array.from(destination);
    var _a = tslib.__read(sourceClone.splice(droppableSource, 1), 1), removed = _a[0];
    destClone.splice(droppableDestination, 0, removed);
    return [sourceClone, destClone];
}

function GridItem(_a) {
    var children = _a.children, style = _a.style, className = _a.className, _b = _a.disabled, disabled = _b === void 0 ? false : _b, other = tslib.__rest(_a, ["children", "style", "className", "disabled"]);
    var context = React.useContext(GridItemContext);
    if (!context) {
        throw Error("Unable to find GridItem context. Please ensure that GridItem is used as a child of GridDropZone");
    }
    var top = context.top, disableDrag = context.disableDrag, endTraverse = context.endTraverse, onStart = context.onStart, mountWithTraverseTarget = context.mountWithTraverseTarget, left = context.left, i = context.i, onMove = context.onMove, onEnd = context.onEnd, grid = context.grid, isDragging = context.dragging;
    var columnWidth = grid.columnWidth, rowHeight = grid.rowHeight;
    var dragging = React.useRef(false);
    var startCoords = React.useRef([left, top]);
    var _c = tslib.__read(reactSpring.useSpring(function () {
        if (mountWithTraverseTarget) {
            // this feels really brittle. unsure of a better
            // solution for now.
            var mountXY = mountWithTraverseTarget;
            endTraverse();
            return {
                xy: mountXY,
                immediate: true,
                zIndex: "1",
                scale: 1.1,
                opacity: 0.8
            };
        }
        return {
            xy: [left, top],
            immediate: true,
            zIndex: "0",
            scale: 1,
            opacity: 1
        };
    }), 2), styles = _c[0], set = _c[1];
    // handle move updates imperatively
    function handleMove(state, e) {
        var x = startCoords.current[0] + state.delta[0];
        var y = startCoords.current[1] + state.delta[1];
        set({
            xy: [x, y],
            zIndex: "1",
            immediate: true,
            opacity: 0.8,
            scale: 1.1
        });
        onMove(state, x, y);
    }
    // handle end of drag
    function handleEnd(state) {
        var x = startCoords.current[0] + state.delta[0];
        var y = startCoords.current[1] + state.delta[1];
        dragging.current = false;
        onEnd(state, x, y);
    }
    var bind = reactGestureResponder.useGestureResponder({
        onMoveShouldSet: function (state) {
            if (disabled || disableDrag) {
                return false;
            }
            onStart();
            startCoords.current = [left, top];
            dragging.current = true;
            return true;
        },
        onMove: handleMove,
        onTerminationRequest: function () {
            if (dragging.current) {
                return false;
            }
            return true;
        },
        onTerminate: handleEnd,
        onRelease: handleEnd
    }, {
        enableMouse: true
    }).bind;
    /**
     * Update our position when left or top
     * values change
     */
    React.useEffect(function () {
        if (!dragging.current) {
            set({
                xy: [left, top],
                zIndex: "0",
                opacity: 1,
                scale: 1,
                immediate: false
            });
        }
    }, [dragging.current, left, top]);
    var props = tslib.__assign(tslib.__assign(tslib.__assign({ className: "GridItem" +
            (isDragging ? " dragging" : "") +
            (!!disableDrag ? " disabled" : "") +
            className
            ? " " + className
            : "" }, bind), { style: tslib.__assign({ cursor: !!disableDrag ? "grab" : undefined, zIndex: styles.zIndex, position: "absolute", width: columnWidth + "px", opacity: styles.opacity, height: rowHeight + "px", boxSizing: "border-box", transform: reactSpring.interpolate([styles.xy, styles.scale], function (xy, s) {
                return "translate3d(" + xy[0] + "px, " + xy[1] + "px, 0) scale(" + s + ")";
            }) }, style) }), other);
    return typeof children === "function" ? (children(reactSpring.animated.div, props, {
        dragging: isDragging,
        disabled: !!disableDrag,
        i: i,
        grid: grid
    })) : (React.createElement(reactSpring.animated.div, tslib.__assign({}, props), children));
}

exports.GridContext = GridContext;
exports.GridContextProvider = GridContextProvider;
exports.GridDropZone = GridDropZone;
exports.GridItem = GridItem;
exports.move = move;
exports.swap = swap;
//# sourceMappingURL=index.js.map
