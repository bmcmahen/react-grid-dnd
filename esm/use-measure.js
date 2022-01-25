import { __read } from "tslib";
import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
export function useMeasure(ref) {
    var _a = __read(React.useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0
    }), 2), bounds = _a[0], setBounds = _a[1];
    var _b = __read(React.useState(function () {
        return new ResizeObserver(function (_a) {
            var _b = __read(_a, 1), entry = _b[0];
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
