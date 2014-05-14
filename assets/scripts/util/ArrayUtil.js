define([
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {
  return Plumage.util.ArrayUtil = {
    /**
     * Similar to _.sortedIndex, but doesn't apply iterator to target value
     */
    findClosestIndexToValue: function(array, value, getValue, context) {
      var low = 0, high = array.length;
      while (low < high) {
        var mid = Math.floor((low + high)/2);
        if (getValue.call(context, array[mid]) < value) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    }
  };
});