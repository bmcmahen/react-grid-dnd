import { __read, __spread } from "tslib";
export function swap(array, moveIndex, toIndex) {
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
        return __spread(array.slice(0, toIndex), [
            item
        ], array.slice(toIndex, moveIndex), array.slice(moveIndex + 1, length));
    }
    else if (diff < 0) {
        // move right
        var targetIndex = toIndex + 1;
        return __spread(array.slice(0, moveIndex), array.slice(moveIndex + 1, targetIndex), [
            item
        ], array.slice(targetIndex, length));
    }
    return array;
}
