/* globals $, _ */

var Plumage = require('PlumageRoot');
var DateTimeUtil = require('util/DateTimeUtil');

module.exports = Plumage.view.grid.Formatters = {

  MoneyFormatter: function(row, cell, value, columnDef, dataContext) {
    if (value && value.toFixed) {
      return value.toFixed(2);
    }
    return value;
  },

  DateFromNowFormatter: function(row, cell, value, columnDef, dataContext) {
    return DateTimeUtil.formatDateFromNow(value);
  },

  DateFormatter: function(row, cell, value, columnDef, dataContext) {
    return DateTimeUtil.formatDate(value, columnDef.dateFormat);
  },

  DateFormatterUTC: function(row, cell, value, columnDef, dataContext) {
    return DateTimeUtil.formatDateUTC(value, columnDef.dateFormat);
  },

  DurationFormatter: function(row, cell, value, columnDef, dataContext) {
    return DateTimeUtil.formatDurationShort(Number(value));
  },

  NameWithCommentsFormatter: function(row, cell, value, columnDef, dataContext) {
    var count = dataContext.get('comments_count');
    if (count > 0) {
      return value + '<span class="comments-count-icon">' + count + '</span>';
    } else {
      return value;
    }
  }
};